package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.usuario.Paciente;
import com.amde.gestao_clinica.usuario.PacienteRepository;
import com.amde.gestao_clinica.usuario.ProntuarioDTO;
import com.amde.gestao_clinica.usuario.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProntuarioService {

    @Autowired
    private HistoricoProntuarioRepository historicoProntuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Value("${storage.prontuarios.dir:uploads/prontuarios}")
    private String storageDir;

    @Transactional
    public ProntuarioDTO salvarProntuario(Long idPaciente, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo não enviado.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new BusinessException("Apenas arquivos PDF são permitidos.");
        }
        // Limite de 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("Arquivo excede o tamanho máximo de 10MB.");
        }

        // Tenta localizar pelo ID do Paciente; se não existir, tenta pelo ID do Usuario associado
        Paciente paciente = pacienteRepository.findById(idPaciente)
            .orElseGet(() -> pacienteRepository.findByUsuarioId(idPaciente)
                .orElseThrow(() -> new BusinessException("Paciente não encontrado para o identificador informado.")));

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "documento.pdf";
        }
        // calcula nome padronizado baseado no paciente e contador sequencial
        Integer atual = paciente.getProntuarioRecente() == null ? 0 : paciente.getProntuarioRecente();
        int proximo = atual + 1;
    String nomePaciente = paciente.getUsuario() != null ? paciente.getUsuario().getNome() : "paciente";
    String baseName = nomePaciente == null ? "paciente" : nomePaciente.trim().replaceAll("[^a-zA-Z0-9]+", "_");
    String safeName = baseName + "_prt" + proximo + ".pdf";

        // Persiste o histórico para obter o ID
        HistoricoProntuario historico = new HistoricoProntuario();
        historico.setPaciente(paciente);
        historico.setNomeArquivo(safeName);
        historico.setDataAtualizacao(LocalDateTime.now());
        historico = historicoProntuarioRepository.save(historico);
        // Atualiza o contador do paciente (monotônico)
        paciente.setProntuarioRecente(proximo);

        // Salva o arquivo fisicamente
    Path baseDir = Paths.get(storageDir).toAbsolutePath().normalize();
    Path pastaPaciente = baseDir.resolve("paciente-" + paciente.getId()).normalize();
        String nomeFisico = "prontuario-" + historico.getId() + "-" + safeName;
        Path destino = pastaPaciente.resolve(nomeFisico).normalize();

        try {
            Files.createDirectories(pastaPaciente);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            // Ao lançar exceção runtime, a transação do save do histórico é revertida
            throw new BusinessException("Falha ao salvar o arquivo do prontuário.");
        }

    ProntuarioDTO dto = new ProntuarioDTO(historico.getId(), historico.getNomeArquivo(), historico.getDataAtualizacao(), null);
    // Preenche displayName calculado
    dto.setDisplayName(obterNomeArquivoPadrao(historico.getId()));
    return dto;
    }

    public Resource carregarProntuario(Long idProntuario) {
        HistoricoProntuario hist = historicoProntuarioRepository.findById(idProntuario)
            .orElseThrow(() -> new BusinessException("Prontuário não encontrado."));

        Long idPaciente = hist.getPaciente().getId();
        String safeName = hist.getNomeArquivo().replaceAll("[^a-zA-Z0-9._-]", "_");

        Path base = Paths.get(storageDir).toAbsolutePath().normalize();
        Path caminho = base
            .resolve("paciente-" + idPaciente)
            .resolve("prontuario-" + hist.getId() + "-" + safeName)
            .normalize();

        try {
            Resource resource = new UrlResource(caminho.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException("Arquivo do prontuário indisponível.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException("Caminho de arquivo inválido.");
        }
    }

    // Retorna um nome de arquivo padronizado: usa historico.nomeArquivo quando disponível
    public String obterNomeArquivoPadrao(Long idProntuario) {
        HistoricoProntuario hist = historicoProntuarioRepository.findById(idProntuario)
            .orElseThrow(() -> new BusinessException("Prontuário não encontrado."));
        String stored = hist.getNomeArquivo();
        if (stored != null && !stored.isBlank()) return stored;
        // fallback para antigos: gera a partir do nome/ordem
        String nomePaciente = hist.getPaciente().getUsuario().getNome();
        String base = nomePaciente == null ? "paciente" : nomePaciente.trim().replaceAll("[^a-zA-Z0-9]+", "_");
        int seq = calcularSequencia(hist);
        return base + "_prt" + seq + ".pdf";
    }

    private int calcularSequencia(HistoricoProntuario atual) {
        Long pacienteId = atual.getPaciente().getId();
        // Busca todos por paciente em ordem de criação (id crescente)
        List<HistoricoProntuario> todos = historicoProntuarioRepository.findByPacienteIdOrderByDataAtualizacaoDesc(pacienteId);
        // A lista atual está em ordem DESC por data; reordena por id ASC para numerar
        todos.sort((a, b) -> Long.compare(a.getId(), b.getId()));
        for (int i = 0; i < todos.size(); i++) {
            if (todos.get(i).getId().equals(atual.getId())) {
                return i + 1;
            }
        }
        return 1; // fallback
    }

    @Transactional
    public void deletarProntuario(Long idProntuario) {
        HistoricoProntuario hist = historicoProntuarioRepository.findById(idProntuario)
            .orElseThrow(() -> new BusinessException("Prontuário não encontrado."));

        Long idPaciente = hist.getPaciente().getId();
        String safeName = hist.getNomeArquivo().replaceAll("[^a-zA-Z0-9._-]", "_");
        Path base = Paths.get(storageDir).toAbsolutePath().normalize();
        Path caminho = base
            .resolve("paciente-" + idPaciente)
            .resolve("prontuario-" + hist.getId() + "-" + safeName)
            .normalize();

        try {
            Files.deleteIfExists(caminho);
        } catch (IOException e) {
            throw new BusinessException("Falha ao remover arquivo do prontuário.");
        }

        historicoProntuarioRepository.delete(hist);
    }
}