package com.amde.gestao_clinica.usuario;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.amde.gestao_clinica.util.JwtUtil;
import com.amde.gestao_clinica.prontuario.HistoricoProntuario;
import com.amde.gestao_clinica.prontuario.HistoricoProntuarioRepository;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UsuarioMapper mapper;
    private final HistoricoProntuarioRepository historicoRepository;
    // MapStruct mapper removed from here; we'll map HistoricoProntuario -> ProntuarioDTO manually

    public UsuarioService(UsuarioRepository repository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          UsuarioMapper mapper,
                          HistoricoProntuarioRepository historicoRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mapper = mapper;
        this.historicoRepository = historicoRepository;
    }

    public List<UsuarioDTO> listarTodos() { 
        return repository.findAll().stream()
                .map(mapper::toDTO).toList();
    }

    public List<UsuarioDTO> listarPorNivel(NivelAcesso nivel) {
        return repository.findByNivelAcesso(nivel).stream()
                .map(mapper::toDTO)
                .toList();
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

    // Token com claims uid, role e nome completo
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

        List<HistoricoProntuario> historicos = historicoRepository
                .findByPacienteIdOrderByDataAtualizacaoDesc(paciente.getId());

        List<ProntuarioDTO> prontuarios = historicos.stream()
                .map(h -> {
                    ProntuarioDTO dto = new ProntuarioDTO();
                    dto.setIdProntuario(h.getId());
                    dto.setNomeArquivo(h.getNomeArquivo());
                    dto.setDataAtualizacao(h.getDataAtualizacao());
                    // displayName será definido abaixo
                    return dto;
                })
                .toList();

        // Preenche displayName com sequência estável baseada em id crescente
        var ordenados = historicos.stream().sorted((a,b) -> Long.compare(a.getId(), b.getId())).toList();
        for (int i = 0; i < ordenados.size(); i++) {
            Long id = ordenados.get(i).getId();
            for (ProntuarioDTO p : prontuarios) {
                if (p.getIdProntuario().equals(id)) {
                    // se nomeArquivo já é padronizado (novos registros), use-o como display
                    if (p.getNomeArquivo() != null && !p.getNomeArquivo().isBlank()) {
                        p.setDisplayName(p.getNomeArquivo());
                    } else {
                        String base = usuario.getNome() == null ? "paciente" : usuario.getNome().trim().replaceAll("[^a-zA-Z0-9]+", "_");
                        p.setDisplayName(base + "_prt" + (i + 1) + ".pdf");
                    }
                    break;
                }
            }
        }

        UsuarioDTO usuarioDTO = mapper.toDTO(usuario);

        return new PerfilPacienteDTO(usuarioDTO, paciente.getDescricao(), prontuarios);
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
                // promover para paciente
                Paciente paciente = new Paciente();
                paciente.setUsuario(usuario);
                if (dto.descPaciente() != null) paciente.setDescricao(dto.descPaciente());
                usuario.setPaciente(paciente);
            } else if (dto.nivelAcesso() != NivelAcesso.PACIENTE && usuario.getPaciente() != null) {
                // remover vínculo de paciente
                usuario.setPaciente(null);
            }
        }

        if (usuario.getNivelAcesso() == NivelAcesso.PACIENTE && dto.descPaciente() != null) {
            if (usuario.getPaciente() != null) {
                usuario.getPaciente().setDescricao(dto.descPaciente());
            }
        }

        Usuario salvo = repository.save(usuario);
        return mapper.toDTO(salvo);
    }

    @Transactional
    public void deletarUsuario(Long id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        repository.delete(usuario);
    }
}