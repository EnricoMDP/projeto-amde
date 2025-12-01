package com.amde.gestao_clinica.usuario;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    // Teste de deploy 3
    private final UsuarioService service;

    // Injeção por construtor (Spring injeta automaticamente)
    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // Lista somente usuários com nível PACIENTE
    @GetMapping("/pacientes")
    public ResponseEntity<List<UsuarioDTO>> listarPacientes() {
        return ResponseEntity.ok(service.listarPorNivel(NivelAcesso.PACIENTE));
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> register(@Valid @RequestBody UsuarioCadastroDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping(value = "/login", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> login(@Valid @RequestBody UsuarioLoginDTO dto) {
        String jwt = service.login(dto);
        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        service.logout();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/perfil")
    public ResponseEntity<PerfilPacienteDTO> obterPerfil(@PathVariable("id") Long id) {
        PerfilPacienteDTO perfil = service.buscarPerfilPacientePorId(id);
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> atualizar(@PathVariable("id") Long id,
                                                @Valid @RequestBody UsuarioAtualizacaoDTO dto) {
        return ResponseEntity.ok(service.atualizarUsuario(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
