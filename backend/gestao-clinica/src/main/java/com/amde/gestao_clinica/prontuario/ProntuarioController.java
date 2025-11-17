package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.ProntuarioDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/prontuarios")
public class ProntuarioController {

    private final ProntuarioService prontuarioService;

    public ProntuarioController(ProntuarioService prontuarioService) {
        this.prontuarioService = prontuarioService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProntuarioDTO> uploadProntuario(
        @RequestParam("idPaciente") Long idPaciente,
        @RequestParam("file") MultipartFile file,
        @RequestParam("idCategoria") Long idCategoria, // Novo campo obrigatório
        @RequestParam(value = "titulo", required = false) String titulo // Novo campo opcional
    ) {
        // Agora chamamos o serviço passando os 4 parâmetros
        ProntuarioDTO dto = prontuarioService.salvarProntuario(idPaciente, file, idCategoria, titulo);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = prontuarioService.carregarProntuario(id);
        
        // Usamos o método novo para pegar o nome amigável (ex: "Raio-X.pdf")
        String filename = prontuarioService.obterNomeOriginal(id);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            // O header abaixo garante que o navegador salve com o nome correto
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"; filename*=UTF-8''" + filename)
            .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        prontuarioService.deletarProntuario(id);
        return ResponseEntity.noContent().build();
    }
}