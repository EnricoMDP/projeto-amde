package com.amde.gestao_clinica.usuario;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.amde.gestao_clinica.util.JwtUtil;
import com.amde.gestao_clinica.prontuario.HistoricoProntuario;
import com.amde.gestao_clinica.prontuario.HistoricoProntuarioRepository;
import com.amde.gestao_clinica.prontuario.HistoricoProntuarioMapper;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UsuarioMapper mapper;
    private final HistoricoProntuarioRepository historicoRepository;
    private final HistoricoProntuarioMapper historicoMapper;

    public UsuarioService(UsuarioRepository repository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          UsuarioMapper mapper,
                          HistoricoProntuarioRepository historicoRepository,
                          HistoricoProntuarioMapper historicoMapper) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mapper = mapper;
        this.historicoRepository = historicoRepository;
        this.historicoMapper = historicoMapper;
    }

    public List<UsuarioDTO> listarTodos() { 
        return repository.findAll().stream()
                .map(mapper::toDTO).toList();
    }

    @Transactional
    public UsuarioDTO register(UsuarioCadastroDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new BusinessException("Email já cadastrado");
        }

        Usuario usuario = mapper.toEntity(dto);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        if (dto.nivelAcesso() == NivelAcesso.PACIENTE) {
            Paciente paciente = mapper.toPaciente(dto);
            paciente.setUsuario(usuario);
            usuario.setPaciente(paciente);
        }

        Usuario salvo = repository.save(usuario);
        return mapper.toDTO(salvo);
    }

    public String login(UsuarioLoginDTO dto) {
        var usuario = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BusinessException("Usuário ou senha inválidos");
        }

        // Usa claims uid e role no JWT (compatível com seu JwtUtil atualizado)
        return jwtUtil.generateToken(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNivelAcesso().name()
        );
    }

    @Transactional(readOnly = true)
    public PerfilPacienteDTO buscarPerfilPacientePorId(Long idUsuario) {
        Usuario usuario = repository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (usuario.getNivelAcesso() != NivelAcesso.PACIENTE) {
            throw new BusinessException("Usuário não é paciente");
        }

        Paciente paciente = usuario.getPaciente();
        if (paciente == null) {
            throw new ResourceNotFoundException("Paciente não encontrado para o usuário");
        }

        List<HistoricoProntuario> historicos = historicoRepository
                .findByPacienteIdOrderByDataAtualizacaoDesc(paciente.getId());

        List<ProntuarioDTO> prontuarios = historicos.stream()
                .map(historicoMapper::toDTO)
                .toList();

        UsuarioDTO usuarioDTO = mapper.toDTO(usuario);

        return new PerfilPacienteDTO(usuarioDTO, paciente.getDescricao(), prontuarios);
    }
}