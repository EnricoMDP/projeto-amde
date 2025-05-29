package com.amde.gestao_clinica.service;

import com.amde.gestao_clinica.dto.UsuarioDTO;
import com.amde.gestao_clinica.dto.UsuarioCadastroDTO;
import com.amde.gestao_clinica.dto.UsuarioLoginDTO;
import com.amde.gestao_clinica.model.Usuario;
import com.amde.gestao_clinica.repository.UsuarioRepository;
import com.amde.gestao_clinica.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public List<UsuarioDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioDTO register(UsuarioCadastroDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setNome(dto.getNome());
        usuario.setNivelAcesso(dto.getNivelAcesso());
        usuario.setDataNasc(dto.getDataNasc());
        usuario.setPais(dto.getPais());
        usuario.setEstado(dto.getEstado());
        usuario.setCidade(dto.getCidade());
        usuario.setRua(dto.getRua());
        usuario.setNumCelular(dto.getNumCelular());
        Usuario salvo = repository.save(usuario);
        return toDTO(salvo);
    }

    public String login(UsuarioLoginDTO dto) {
        Optional<Usuario> usuarioOpt = repository.findByEmail(dto.getEmail());
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }
        Usuario usuario = usuarioOpt.get();
        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }
        return jwtUtil.generateToken(usuario.getEmail());
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setEmail(usuario.getEmail());
        dto.setNome(usuario.getNome());
        dto.setNivelAcesso(usuario.getNivelAcesso());
        dto.setDataNasc(usuario.getDataNasc());
        dto.setPais(usuario.getPais());
        dto.setEstado(usuario.getEstado());
        dto.setCidade(usuario.getCidade());
        dto.setRua(usuario.getRua());
        dto.setNumCelular(usuario.getNumCelular());
        return dto;
    }
}
