package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.Paciente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/prontuarios")
public class ProntuarioController {

    @Autowired
    private ProntuarioService prontuarioService;

    @PostMapping("/upload")
    public void uploadProntuario(
        @RequestParam("idPaciente") Long idPaciente,
        @RequestParam("file") MultipartFile file
    ) {
        prontuarioService.salvarProntuario(idPaciente, file);
    }
}