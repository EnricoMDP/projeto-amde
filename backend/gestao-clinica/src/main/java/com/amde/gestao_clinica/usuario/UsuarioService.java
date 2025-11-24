package com.amde.gestao_clinica.usuario;

import com.amde.gestao_clinica.logger.AuditoriaService;
import com.amde.gestao_clinica.prontuario.RegistroProntuario;
import com.amde.gestao_clinica.prontuario.RegistroProntuarioMapper;
import com.amde.gestao_clinica.prontuario.RegistroProntuarioRepository;
import com.amde.gestao_clinica.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UsuarioMapper usuarioMapper;
    private final RegistroProntuarioRepository registroRepository; // Renomeado
    private final RegistroProntuarioMapper registroProntuarioMapper; // Novo mapper injetado
    private final AuditoriaService auditoriaService;
    private final FuncionarioRepository funcionarioRepository;

    public UsuarioService(UsuarioRepository repository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          UsuarioMapper usuarioMapper,
                          RegistroProntuarioRepository registroRepository,
                          RegistroProntuarioMapper registroProntuarioMapper,
                          AuditoriaService auditoriaService,
                          FuncionarioRepository funcionarioRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.usuarioMapper = usuarioMapper;
        this.registroRepository = registroRepository;
        this.registroProntuarioMapper = registroProntuarioMapper;
        this.auditoriaService = auditoriaService;
        this.funcionarioRepository = funcionarioRepository;
    }

    public List<UsuarioDTO> listarTodos() { 
        return repository.findAll().stream()
                .map(usuarioMapper::toDTO).toList();
    }

    public List<UsuarioDTO> listarPorNivel(NivelAcesso nivel) {
        return repository.findByNivelAcesso(nivel).stream()
                .map(usuarioMapper::toDTO)
                .toList();
    }

    @Transactional
    public UsuarioDTO register(UsuarioCadastroDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new BusinessException("Email já cadastrado");
        }
        
        // Validar CPF duplicado se fornecido
        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            String cpfLimpo = dto.cpf().replaceAll("[^0-9]", "");
            if (repository.existsByCpf(cpfLimpo)) {
                throw new BusinessException("CPF já cadastrado no sistema");
            }
        }
        
        // Validar CRM duplicado se fornecido
        if (dto.crm() != null && !dto.crm().isBlank()) {
            if (funcionarioRepository.existsByCrm(dto.crm())) {
                throw new BusinessException("CRM já cadastrado no sistema");
            }
        }

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        if (dto.nivelAcesso() == NivelAcesso.PACIENTE) {
            Paciente paciente = usuarioMapper.toPaciente(dto);
            paciente.setUsuario(usuario);
            // Define o grauSuporte se fornecido
            if (dto.grauSuporte() != null) {
                paciente.setGrauSuporte(dto.grauSuporte());
            }
            usuario.setPaciente(paciente);
        } else if (dto.nivelAcesso() == NivelAcesso.MEDICO || dto.nivelAcesso() == NivelAcesso.ADMINISTRADOR) {
            Funcionario funcionario = new Funcionario();
            funcionario.setUsuario(usuario);
            
            if (dto.cargo() != null && !dto.cargo().isBlank()) {
                funcionario.setCargo(dto.cargo());
            } else if (dto.nivelAcesso() == NivelAcesso.MEDICO) {
                funcionario.setCargo("Clínico Geral");
            }
            
            // Adiciona CRM se fornecido
            if (dto.crm() != null && !dto.crm().isBlank()) {
                funcionario.setCrm(dto.crm());
            }
            
            usuario.setFuncionario(funcionario);
        }

        Usuario salvo = repository.save(usuario);
        
        // Registrar log de auditoria
        String detalhes = String.format("Email: %s, Nível: %s, ID: %d", 
                                        salvo.getEmail(), 
                                        salvo.getNivelAcesso(), 
                                        salvo.getId());
        auditoriaService.registrarLog("CADASTRO_USUARIO", detalhes);
        
        return usuarioMapper.toDTO(salvo);
    }

    public String login(UsuarioLoginDTO dto) {
        var usuario = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BusinessException("Usuário ou senha inválidos");
        }

        String token = jwtUtil.generateToken(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNivelAcesso().name(),
            usuario.getNome()
        );
        
        // Registrar log de auditoria - LOGIN BEM-SUCEDIDO
        String detalhes = String.format("Email: %s, Nível: %s", 
                                        usuario.getEmail(), 
                                        usuario.getNivelAcesso());
        auditoriaService.registrarLog("LOGIN", detalhes);
        
        return token;
    }

    public void logout() {
        // Registrar log de auditoria - LOGOUT
        // O usuário é capturado automaticamente do SecurityContext pelo AuditoriaService
        auditoriaService.registrarLog("LOGOUT", "Usuário desconectado do sistema");
    }

    @Transactional(readOnly = true)
    public PerfilPacienteDTO buscarPerfilPacientePorId(Long idUsuario) {
        Usuario usuario = repository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (usuario.getNivelAcesso() != NivelAcesso.PACIENTE) {
            throw new BusinessException("Usuário não é paciente");
        }

        Paciente paciente = usuario.getPaciente();
        if (paciente == null) {
            throw new ResourceNotFoundException("Paciente não encontrado para o usuário");
        }

        // BUSCA ATUALIZADA: Usa o novo método do repositório que filtra substituídos
        List<RegistroProntuario> registros = registroRepository
                .findByPacienteIdAndRegistroSubstituidoIsNullOrderByCategoriaIdCategoriaAscDataRegistroDesc(paciente.getId());

        // MAPEAMENTO SIMPLIFICADO: Usa o MapStruct
        List<ProntuarioDTO> prontuarios = registros.stream()
                .map(registroProntuarioMapper::toDTO)
                .toList();

        UsuarioDTO usuarioDTO = usuarioMapper.toDTO(usuario);

        return new PerfilPacienteDTO(usuarioDTO, paciente.getDescricao(), paciente.getGrauSuporte(), prontuarios);
    }

    @Transactional
    public UsuarioDTO atualizarUsuario(Long id, UsuarioAtualizacaoDTO dto) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (dto.email() != null && !dto.email().equals(usuario.getEmail()) && repository.existsByEmail(dto.email())) {
            throw new BusinessException("Email já cadastrado");
        }
        
        // Validar CPF duplicado se fornecido e diferente do atual
        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            String cpfLimpo = dto.cpf().replaceAll("[^0-9]", "");
            String cpfAtualLimpo = usuario.getCpf() != null ? usuario.getCpf().replaceAll("[^0-9]", "") : null;
            
            if (!cpfLimpo.equals(cpfAtualLimpo) && repository.existsByCpf(cpfLimpo)) {
                throw new BusinessException("CPF já cadastrado no sistema");
            }
        }
        
        // Validar CRM duplicado se fornecido e diferente do atual
        if (dto.crm() != null && !dto.crm().isBlank()) {
            String crmAtual = usuario.getFuncionario() != null ? usuario.getFuncionario().getCrm() : null;
            
            if (!dto.crm().equals(crmAtual) && funcionarioRepository.existsByCrm(dto.crm())) {
                throw new BusinessException("CRM já cadastrado no sistema");
            }
        }

        // StringBuilder para registrar alterações
        StringBuilder alteracoes = new StringBuilder();
        alteracoes.append("ID: ").append(id).append(" | Campos alterados: ");
        boolean houveAlteracao = false;

        if (dto.nome() != null && !dto.nome().equals(usuario.getNome())) {
            alteracoes.append("[Nome: '").append(usuario.getNome()).append("' → '").append(dto.nome()).append("'] ");
            usuario.setNome(dto.nome());
            houveAlteracao = true;
        }
        if (dto.email() != null && !dto.email().equals(usuario.getEmail())) {
            alteracoes.append("[Email: '").append(usuario.getEmail()).append("' → '").append(dto.email()).append("'] ");
            usuario.setEmail(dto.email());
            houveAlteracao = true;
        }
        if (dto.cpf() != null && !dto.cpf().equals(usuario.getCpf())) {
            alteracoes.append("[CPF: '").append(usuario.getCpf()).append("' → '").append(dto.cpf()).append("'] ");
            usuario.setCpf(dto.cpf());
            houveAlteracao = true;
        }
        if (dto.numCelular() != null && !dto.numCelular().equals(usuario.getNumCelular())) {
            alteracoes.append("[Celular: '").append(usuario.getNumCelular()).append("' → '").append(dto.numCelular()).append("'] ");
            usuario.setNumCelular(dto.numCelular());
            houveAlteracao = true;
        }
        if (dto.pais() != null && !dto.pais().equals(usuario.getPais())) {
            alteracoes.append("[País: '").append(usuario.getPais()).append("' → '").append(dto.pais()).append("'] ");
            usuario.setPais(dto.pais());
            houveAlteracao = true;
        }
        if (dto.estado() != null && !dto.estado().equals(usuario.getEstado())) {
            alteracoes.append("[Estado: '").append(usuario.getEstado()).append("' → '").append(dto.estado()).append("'] ");
            usuario.setEstado(dto.estado());
            houveAlteracao = true;
        }
        if (dto.cidade() != null && !dto.cidade().equals(usuario.getCidade())) {
            alteracoes.append("[Cidade: '").append(usuario.getCidade()).append("' → '").append(dto.cidade()).append("'] ");
            usuario.setCidade(dto.cidade());
            houveAlteracao = true;
        }
        if (dto.rua() != null && !dto.rua().equals(usuario.getRua())) {
            alteracoes.append("[Rua: '").append(usuario.getRua()).append("' → '").append(dto.rua()).append("'] ");
            usuario.setRua(dto.rua());
            houveAlteracao = true;
        }
        if (dto.dataNasc() != null && !dto.dataNasc().equals(usuario.getDataNasc())) {
            alteracoes.append("[Data Nasc: '").append(usuario.getDataNasc()).append("' → '").append(dto.dataNasc()).append("'] ");
            usuario.setDataNasc(dto.dataNasc());
            houveAlteracao = true;
        }

        if (dto.nivelAcesso() != null && dto.nivelAcesso() != usuario.getNivelAcesso()) {
            alteracoes.append("[Nível Acesso: '").append(usuario.getNivelAcesso()).append("' → '").append(dto.nivelAcesso()).append("'] ");
            usuario.setNivelAcesso(dto.nivelAcesso());
            houveAlteracao = true;
            
            if (dto.nivelAcesso() == NivelAcesso.PACIENTE && usuario.getPaciente() == null) {
                Paciente paciente = new Paciente();
                paciente.setUsuario(usuario);
                if (dto.descPaciente() != null) paciente.setDescricao(dto.descPaciente());
                if (dto.grauSuporte() != null) paciente.setGrauSuporte(dto.grauSuporte());
                usuario.setPaciente(paciente);
            } else if (dto.nivelAcesso() != NivelAcesso.PACIENTE && usuario.getPaciente() != null) {
                usuario.setPaciente(null);
            }
        }

        if (usuario.getNivelAcesso() == NivelAcesso.PACIENTE && usuario.getPaciente() != null) {
            if (dto.descPaciente() != null && !dto.descPaciente().equals(usuario.getPaciente().getDescricao())) {
                alteracoes.append("[Descrição Paciente: '").append(usuario.getPaciente().getDescricao()).append("' → '").append(dto.descPaciente()).append("'] ");
                usuario.getPaciente().setDescricao(dto.descPaciente());
                houveAlteracao = true;
            }
            if (dto.grauSuporte() != null && !dto.grauSuporte().equals(usuario.getPaciente().getGrauSuporte())) {
                alteracoes.append("[Grau Suporte: '").append(usuario.getPaciente().getGrauSuporte()).append("' → '").append(dto.grauSuporte()).append("'] ");
                usuario.getPaciente().setGrauSuporte(dto.grauSuporte());
                houveAlteracao = true;
            }
        }

        // Atualizar CRM se o usuário for funcionário (MEDICO ou ADMINISTRADOR)
        if ((usuario.getNivelAcesso() == NivelAcesso.MEDICO || usuario.getNivelAcesso() == NivelAcesso.ADMINISTRADOR) 
            && usuario.getFuncionario() != null) {
            if (dto.crm() != null && !dto.crm().equals(usuario.getFuncionario().getCrm())) {
                alteracoes.append("[CRM: '").append(usuario.getFuncionario().getCrm()).append("' → '").append(dto.crm()).append("'] ");
                usuario.getFuncionario().setCrm(dto.crm());
                houveAlteracao = true;
            }
        }

        Usuario salvo = repository.save(usuario);
        
        // Registrar log de auditoria com detalhes das alterações
        if (houveAlteracao) {
            auditoriaService.registrarLog("ATUALIZACAO_USUARIO", alteracoes.toString());
        }
        
        return usuarioMapper.toDTO(salvo);
    }

    @Transactional
    public void deletarUsuario(Long id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        // Registrar log de auditoria ANTES de deletar
        String detalhes = String.format("Email: %s, ID: %d", usuario.getEmail(), usuario.getId());
        auditoriaService.registrarLog("EXCLUSAO_USUARIO", detalhes);
        
        repository.delete(usuario);
    }
}