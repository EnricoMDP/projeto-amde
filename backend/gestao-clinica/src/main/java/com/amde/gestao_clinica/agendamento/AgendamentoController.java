package com.amde.gestao_clinica.agendamento;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    // 1. CREATE (POST)
    @PostMapping
    public ResponseEntity<AgendamentoDTO> criar(@Valid @RequestBody AgendamentoCadastroDTO dto) {
        AgendamentoDTO novoAgendamento = service.criarAgendamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoAgendamento);
    }
    
    // 2. READ ALL (GET)
    @GetMapping
    public ResponseEntity<List<AgendamentoDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarAgendamentos());
    }

    // 3. READ ONE (GET by ID)
    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoDTO> obterPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.obterAgendamento(id));
    }

    // 4. UPDATE (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoDTO> atualizar(@PathVariable("id") Long id,
                                                    @Valid @RequestBody AgendamentoAtualizacaoDTO dto) {
        AgendamentoDTO agendamentoAtualizado = service.atualizarAgendamento(id, dto);
        return ResponseEntity.ok(agendamentoAtualizado);
    }

    // 5. DELETE (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable("id") Long id) {
        service.deletarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
}