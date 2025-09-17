package com.amde.gestao_clinica.usuario;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    // Injeção por construtor (Spring injeta automaticamente)
    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> register(@RequestBody UsuarioCadastroDTO dto) {
        return ResponseEntity.ok(service.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UsuarioLoginDTO dto) {
        String jwt = service.login(dto);
        return ResponseEntity.ok(jwt);
    }

    @GetMapping("/{id}/perfil")
    public ResponseEntity<PerfilPacienteDTO> obterPerfil(@PathVariable("id") Long id) {
        PerfilPacienteDTO perfil = service.buscarPerfilPacientePorId(id);
        return ResponseEntity.ok(perfil);
    }
}
