package com.amde.gestao_clinica.agendamento;

import com.amde.gestao_clinica.logger.AuditoriaService;
import com.amde.gestao_clinica.usuario.BusinessException;
import com.amde.gestao_clinica.usuario.FuncionarioRepository;
import com.amde.gestao_clinica.usuario.PacienteRepository;
import com.amde.gestao_clinica.usuario.Paciente;
import com.amde.gestao_clinica.usuario.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PacienteRepository pacienteRepository;
    private final AgendaPacienteRepository agendaPacienteRepository;
    private final AuditoriaService auditoriaService;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              FuncionarioRepository funcionarioRepository,
                              PacienteRepository pacienteRepository,
                              AgendaPacienteRepository agendaPacienteRepository,
                              AuditoriaService auditoriaService) {
        this.agendamentoRepository = agendamentoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.agendaPacienteRepository = agendaPacienteRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public AgendamentoDTO criarAgendamento(AgendamentoCadastroDTO dto) {
        // ... (Validações mantidas) ...

        // 1. Validação Básica
        if (dto.dataInicio().isAfter(dto.dataFinal()) || dto.dataInicio().isEqual(dto.dataFinal())) {
            throw new BusinessException("A data de início deve ser anterior à data final.");
        }

        // 2. Buscar Entidades
        var funcionario = funcionarioRepository.findByUsuarioId(dto.idFuncionario())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));
        var paciente = pacienteRepository.findByUsuarioId(dto.idPaciente())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado."));

        // 3. Checar Conflito de Horário (para o funcionário)
        List<Agendamento> conflitos = agendamentoRepository.findByFuncionarioIdAndDataFinalAfterAndDataInicioBefore(
                dto.idFuncionario(),
                dto.dataInicio(),
                dto.dataFinal()
        );

        if (!conflitos.isEmpty()) {
            throw new BusinessException("Conflito de horário! O funcionário já tem um agendamento neste período.");
        }

        // 4. Criar Agendamento Principal
        Agendamento agendamento = new Agendamento();
        agendamento.setFuncionario(funcionario);
        agendamento.setDataInicio(dto.dataInicio());
        agendamento.setDataFinal(dto.dataFinal());
        agendamento.setStatus("Agendado");
        agendamento.setTipoAgendamento(dto.tipoAgendamento());
        agendamento.setPresencaFuncionario(false);

        agendamento = agendamentoRepository.save(agendamento);

        // 5. Criar Vínculo com Paciente (AgendaPaciente)
        AgendaPaciente agendaPaciente = new AgendaPaciente();
        agendaPaciente.setAgendamento(agendamento);
        agendaPaciente.setPaciente(paciente);
        agendaPaciente.setPresencaPaciente(false);
        agendaPaciente = agendaPacienteRepository.save(agendaPaciente); // Salvamos explicitamente
        
        agendamento.getPacientesAgendados().add(agendaPaciente);

        // 6. Registrar log de auditoria
        String detalhes = String.format(
            "ID Agendamento: %d, Paciente: %s (ID: %d), Funcionário: %s (ID: %d), Tipo: %s, Data: %s a %s",
            agendamento.getId(),
            paciente.getUsuario().getNome(),
            paciente.getId(),
            funcionario.getUsuario().getNome(),
            funcionario.getId(),
            dto.tipoAgendamento(),
            dto.dataInicio(),
            dto.dataFinal()
        );
        auditoriaService.registrarLog("CRIACAO_AGENDAMENTO", detalhes);

        return toDTO(agendamento);
    }
    
    @Transactional
    public AgendamentoDTO atualizarAgendamento(Long id, AgendamentoAtualizacaoDTO dto) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
        
        // 1. Validação Básica
        if (dto.dataInicio().isAfter(dto.dataFinal()) || dto.dataInicio().isEqual(dto.dataFinal())) {
            throw new BusinessException("A data de início deve ser anterior à data final.");
        }

        // StringBuilder para registrar alterações
        StringBuilder alteracoes = new StringBuilder();
        alteracoes.append("ID: ").append(id).append(" | Campos alterados: ");
        boolean houveAlteracao = false;

        // 2. Atualizar Agendamento Principal
        var funcionario = funcionarioRepository.findByUsuarioId(dto.idFuncionario())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));

        if (!agendamento.getFuncionario().getId().equals(funcionario.getId())) {
            alteracoes.append("[Funcionário: ID ").append(agendamento.getFuncionario().getId())
                     .append(" → ID ").append(funcionario.getId()).append("] ");
            agendamento.setFuncionario(funcionario);
            houveAlteracao = true;
        }

        if (!agendamento.getDataInicio().equals(dto.dataInicio())) {
            alteracoes.append("[Data Início: '").append(agendamento.getDataInicio())
                     .append("' → '").append(dto.dataInicio()).append("'] ");
            agendamento.setDataInicio(dto.dataInicio());
            houveAlteracao = true;
        }

        if (!agendamento.getDataFinal().equals(dto.dataFinal())) {
            alteracoes.append("[Data Final: '").append(agendamento.getDataFinal())
                     .append("' → '").append(dto.dataFinal()).append("'] ");
            agendamento.setDataFinal(dto.dataFinal());
            houveAlteracao = true;
        }

        if (!agendamento.getStatus().equals(dto.status())) {
            alteracoes.append("[Status: '").append(agendamento.getStatus())
                     .append("' → '").append(dto.status()).append("'] ");
            agendamento.setStatus(dto.status());
            houveAlteracao = true;
        }

        if (!agendamento.getTipoAgendamento().equals(dto.tipoAgendamento())) {
            alteracoes.append("[Tipo: '").append(agendamento.getTipoAgendamento())
                     .append("' → '").append(dto.tipoAgendamento()).append("'] ");
            agendamento.setTipoAgendamento(dto.tipoAgendamento());
            houveAlteracao = true;
        }

        // 3. Atualizar Vínculo com Paciente (Simplificado para o primeiro paciente)
        if (!agendamento.getPacientesAgendados().isEmpty()) {
            AgendaPaciente agendaPaciente = agendamento.getPacientesAgendados().get(0);
            Paciente novoPaciente = pacienteRepository.findByUsuarioId(dto.idPaciente())
                    .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado."));
            
            if (!agendaPaciente.getPaciente().getId().equals(novoPaciente.getId())) {
                alteracoes.append("[Paciente: ID ").append(agendaPaciente.getPaciente().getId())
                         .append(" → ID ").append(novoPaciente.getId()).append("] ");
                agendaPaciente.setPaciente(novoPaciente);
                agendaPacienteRepository.save(agendaPaciente);
                houveAlteracao = true;
            }
        } else {
            // Se não tinha paciente, cria
             Paciente novoPaciente = pacienteRepository.findByUsuarioId(dto.idPaciente())
                    .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado."));
             AgendaPaciente novaAgendaPaciente = new AgendaPaciente();
             novaAgendaPaciente.setAgendamento(agendamento);
             novaAgendaPaciente.setPaciente(novoPaciente);
             agendaPacienteRepository.save(novaAgendaPaciente);
             agendamento.getPacientesAgendados().add(novaAgendaPaciente);
             alteracoes.append("[Paciente adicionado: ID ").append(novoPaciente.getId()).append("] ");
             houveAlteracao = true;
        }

        Agendamento atualizado = agendamentoRepository.save(agendamento);

        // Registrar log de auditoria com detalhes das alterações
        if (houveAlteracao) {
            auditoriaService.registrarLog("ATUALIZACAO_AGENDAMENTO", alteracoes.toString());
        }

        return toDTO(atualizado);
    }

    @Transactional
    public void deletarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
        
        // Registrar log antes de deletar
        String detalhes = String.format(
            "ID Agendamento: %d, Tipo: %s, Data: %s a %s",
            agendamento.getId(),
            agendamento.getTipoAgendamento(),
            agendamento.getDataInicio(),
            agendamento.getDataFinal()
        );
        auditoriaService.registrarLog("EXCLUSAO_AGENDAMENTO", detalhes);
        
        // O relacionamento está configurado com orphanRemoval=true, o que deve remover AgendaPaciente em cascata.
        agendamentoRepository.delete(agendamento);
    }

    public AgendamentoDTO obterAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
        
        // Registrar log de consulta
        String detalhes = String.format("ID Agendamento: %d", id);
        auditoriaService.registrarLog("CONSULTA_AGENDAMENTO", detalhes);
        
        return toDTO(agendamento);
    }

    public List<AgendamentoDTO> listarAgendamentos() {
        return agendamentoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }
    
    // Método auxiliar para conversão (mantido para a prova de conceito)
    private AgendamentoDTO toDTO(Agendamento agendamento) {
        AgendamentoDTO dto = new AgendamentoDTO();
        dto.setId(agendamento.getId());
        dto.setDataInicio(agendamento.getDataInicio());
        dto.setDataFinal(agendamento.getDataFinal());
        dto.setStatus(agendamento.getStatus());
        dto.setTipoAgendamento(agendamento.getTipoAgendamento());
        dto.setPresencaFuncionario(agendamento.getPresencaFuncionario());

        dto.setNomeFuncionario(agendamento.getFuncionario().getUsuario().getNome());
        dto.setIdFuncionario(agendamento.getFuncionario().getId());
        dto.setCargoFuncionario(agendamento.getFuncionario().getCargo());

        // Para simplificar, assume o primeiro paciente na lista
        if (!agendamento.getPacientesAgendados().isEmpty()) {
            Paciente paciente = agendamento.getPacientesAgendados().get(0).getPaciente();
            dto.setNomePaciente(paciente.getUsuario().getNome());
            dto.setIdPaciente(paciente.getId());
        }

        return dto;
    }
}