package com.amde.gestao_clinica.usuario;

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

    public UsuarioService(UsuarioRepository repository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          UsuarioMapper usuarioMapper,
                          RegistroProntuarioRepository registroRepository,
                          RegistroProntuarioMapper registroProntuarioMapper) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.usuarioMapper = usuarioMapper;
        this.registroRepository = registroRepository;
        this.registroProntuarioMapper = registroProntuarioMapper;
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
            
            usuario.setFuncionario(funcionario);
        }

        Usuario salvo = repository.save(usuario);
        return usuarioMapper.toDTO(salvo);
    }

    public String login(UsuarioLoginDTO dto) {
        var usuario = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BusinessException("Usuário ou senha inválidos");
        }

        return jwtUtil.generateToken(
            usuario.getId(),
            usuario.getEmail(),
            usuario.getNivelAcesso().name(),
            usuario.getNome()
        );
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

        if (dto.nome() != null) usuario.setNome(dto.nome());
        if (dto.email() != null) usuario.setEmail(dto.email());
        if (dto.numCelular() != null) usuario.setNumCelular(dto.numCelular());
        if (dto.pais() != null) usuario.setPais(dto.pais());
        if (dto.estado() != null) usuario.setEstado(dto.estado());
        if (dto.cidade() != null) usuario.setCidade(dto.cidade());
        if (dto.rua() != null) usuario.setRua(dto.rua());
        if (dto.dataNasc() != null) usuario.setDataNasc(dto.dataNasc());

        if (dto.nivelAcesso() != null && dto.nivelAcesso() != usuario.getNivelAcesso()) {
            usuario.setNivelAcesso(dto.nivelAcesso());
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
            if (dto.descPaciente() != null) {
                usuario.getPaciente().setDescricao(dto.descPaciente());
            }
            if (dto.grauSuporte() != null) {
                usuario.getPaciente().setGrauSuporte(dto.grauSuporte());
            }
        }

        Usuario salvo = repository.save(usuario);
        return usuarioMapper.toDTO(salvo);
    }

    @Transactional
    public void deletarUsuario(Long id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        repository.delete(usuario);
    }
}