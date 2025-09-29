package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.Paciente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class ProntuarioService {

    @Autowired
    private HistoricoProntuarioRepository historicoProntuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository; // Crie se não existir

    public void salvarProntuario(Long idPaciente, MultipartFile file) {
        Paciente paciente = pacienteRepository.findById(idPaciente)
            .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        HistoricoProntuario prontuario = new HistoricoProntuario();
        prontuario.setPaciente(paciente);
        prontuario.setNomeArquivo(file.getOriginalFilename());
        prontuario.setDataAtualizacao(LocalDateTime.now());

        // Aqui você pode salvar o arquivo em disco ou em outro storage, se necessário

        historicoProntuarioRepository.save(prontuario);
    }
}