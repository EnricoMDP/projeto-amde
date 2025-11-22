package com.amde.gestao_clinica.agendamento;

import com.amde.gestao_clinica.usuario.BusinessException;
import com.amde.gestao_clinica.usuario.FuncionarioRepository;
import com.amde.gestao_clinica.usuario.PacienteRepository;
import com.amde.gestao_clinica.usuario.Paciente;
import com.amde.gestao_clinica.usuario.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PacienteRepository pacienteRepository;
    private final AgendaPacienteRepository agendaPacienteRepository; // Injetado para gerenciar links

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              FuncionarioRepository funcionarioRepository,
                              PacienteRepository pacienteRepository,
                              AgendaPacienteRepository agendaPacienteRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.agendaPacienteRepository = agendaPacienteRepository;
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
        var paciente = pacienteRepository.findById(dto.idPaciente())
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

        // 2. Atualizar Agendamento Principal
        var funcionario = funcionarioRepository.findByUsuarioId(dto.idFuncionario())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado."));

        agendamento.setFuncionario(funcionario);
        agendamento.setDataInicio(dto.dataInicio());
        agendamento.setDataFinal(dto.dataFinal());
        agendamento.setStatus(dto.status());
        agendamento.setTipoAgendamento(dto.tipoAgendamento());

        // 3. Atualizar Vínculo com Paciente (Simplificado para o primeiro paciente)
        if (!agendamento.getPacientesAgendados().isEmpty()) {
            AgendaPaciente agendaPaciente = agendamento.getPacientesAgendados().get(0);
            Paciente novoPaciente = pacienteRepository.findById(dto.idPaciente())
                    .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado."));
            agendaPaciente.setPaciente(novoPaciente);
            agendaPacienteRepository.save(agendaPaciente);
        } else {
            // Se não tinha paciente, cria
             Paciente novoPaciente = pacienteRepository.findById(dto.idPaciente())
                    .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado."));
             AgendaPaciente novaAgendaPaciente = new AgendaPaciente();
             novaAgendaPaciente.setAgendamento(agendamento);
             novaAgendaPaciente.setPaciente(novoPaciente);
             agendaPacienteRepository.save(novaAgendaPaciente);
             agendamento.getPacientesAgendados().add(novaAgendaPaciente);
        }

        return toDTO(agendamentoRepository.save(agendamento));
    }

    @Transactional
    public void deletarAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
        
        // O relacionamento está configurado com orphanRemoval=true, o que deve remover AgendaPaciente em cascata.
        agendamentoRepository.delete(agendamento);
    }

    public AgendamentoDTO obterAgendamento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado."));
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