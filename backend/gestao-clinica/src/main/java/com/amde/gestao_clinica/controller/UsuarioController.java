package com.amde.gestao_clinica.controller;

import com.amde.gestao_clinica.dto.UsuarioDTO;
import com.amde.gestao_clinica.dto.UsuarioCadastroDTO;
import com.amde.gestao_clinica.dto.UsuarioLoginDTO;
import com.amde.gestao_clinica.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

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
}
