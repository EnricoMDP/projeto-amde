package com.amde.gestao_clinica.prontuario;

import com.amde.gestao_clinica.logger.AuditoriaService;
import com.amde.gestao_clinica.usuario.BusinessException;
import com.amde.gestao_clinica.usuario.Paciente;
import com.amde.gestao_clinica.usuario.PacienteRepository;
import com.amde.gestao_clinica.usuario.ProntuarioDTO;
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
import java.util.UUID;

@Service
public class ProntuarioService {

    private final RegistroProntuarioRepository registroRepository;
    private final CategoriaProntuarioRepository categoriaRepository;
    private final PacienteRepository pacienteRepository;
    private final RegistroProntuarioMapper registroMapper;
    private final AuditoriaService auditoriaService;

    @Value("${storage.prontuarios.dir:uploads/prontuarios}")
    private String storageDir;

    public ProntuarioService(RegistroProntuarioRepository registroRepository,
                             CategoriaProntuarioRepository categoriaRepository,
                             PacienteRepository pacienteRepository,
                             RegistroProntuarioMapper registroMapper,
                             AuditoriaService auditoriaService) {
        this.registroRepository = registroRepository;
        this.categoriaRepository = categoriaRepository;
        this.pacienteRepository = pacienteRepository;
        this.registroMapper = registroMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public ProntuarioDTO salvarProntuario(Long idPaciente, MultipartFile file, Long idCategoria, String tituloDocumento) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Arquivo não enviado.");
        }
        // Validações básicas (PDF, tamanho) mantidas
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new BusinessException("Apenas arquivos PDF são permitidos.");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("Arquivo excede o tamanho máximo de 10MB.");
        }

        Paciente paciente = pacienteRepository.findById(idPaciente)
            .orElseGet(() -> pacienteRepository.findByUsuarioId(idPaciente)
                .orElseThrow(() -> new BusinessException("Paciente não encontrado.")));

        CategoriaProntuario categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(() -> new BusinessException("Categoria inválida."));

        // 1. Gerar nome físico único (UUID)
        String ext = ".pdf"; // Já validamos que é PDF
        String storageName = UUID.randomUUID().toString() + ext;

        // 2. Preparar registro
        RegistroProntuario registro = new RegistroProntuario();
        registro.setPaciente(paciente);
        registro.setCategoria(categoria);
        registro.setTituloDocumento(tituloDocumento != null && !tituloDocumento.isBlank() ? tituloDocumento : file.getOriginalFilename());
        registro.setNomeArquivoOriginal(file.getOriginalFilename());
        registro.setNomeArquivoStorage(storageName);
        registro.setDataRegistro(LocalDateTime.now());
        
        // Nota: Futuramente aqui entraria a lógica de versionamento (setRegistroSubstituido)

        // 3. Salvar arquivo físico
        Path baseDir = Paths.get(storageDir).toAbsolutePath().normalize();
        Path pastaPaciente = baseDir.resolve("paciente-" + paciente.getId()).normalize();
        Path destino = pastaPaciente.resolve(storageName).normalize();

        try {
            Files.createDirectories(pastaPaciente);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Falha ao salvar o arquivo do prontuário.");
        }

        // 4. Salvar no banco
        registro = registroRepository.save(registro);
        
        // 5. Registrar log de auditoria
        String detalhes = String.format("Paciente ID: %d, Categoria: %s, Arquivo: %s, Registro ID: %d", 
                                        paciente.getId(), 
                                        categoria.getNome(),
                                        registro.getNomeArquivoOriginal(),
                                        registro.getIdRegistro());
        auditoriaService.registrarLog("UPLOAD_PRONTUARIO", detalhes);

        return registroMapper.toDTO(registro);
    }

    public Resource carregarProntuario(Long idRegistro) {
        RegistroProntuario reg = registroRepository.findById(idRegistro)
            .orElseThrow(() -> new BusinessException("Prontuário não encontrado."));

        Path base = Paths.get(storageDir).toAbsolutePath().normalize();
        Path caminho = base
            .resolve("paciente-" + reg.getPaciente().getId())
            .resolve(reg.getNomeArquivoStorage()) // Usa o nome do storage (UUID)
            .normalize();

        try {
            Resource resource = new UrlResource(caminho.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                // Fallback para arquivos antigos (antes da migração) que não usam UUID
                // Tenta achar com o nome que está no banco se o UUID falhar
                 throw new BusinessException("Arquivo indisponível no servidor.");
            }
            
            // Registrar log de auditoria do download
            String detalhes = String.format("Paciente: %s (ID: %d) | Categoria: %s | Arquivo: %s | Registro ID: %d", 
                                            reg.getPaciente().getUsuario().getNome(),
                                            reg.getPaciente().getId(),
                                            reg.getCategoria().getNome(),
                                            reg.getNomeArquivoOriginal(),
                                            reg.getIdRegistro());
            auditoriaService.registrarLog("DOWNLOAD_PRONTUARIO", detalhes);
            
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessException("Caminho de arquivo inválido.");
        }
    }
    
    public String obterNomeOriginal(Long idRegistro) {
        return registroRepository.findById(idRegistro)
                .map(RegistroProntuario::getNomeArquivoOriginal)
                .orElse("documento.pdf");
    }

    @Transactional
    public void deletarProntuario(Long idRegistro) {
        RegistroProntuario reg = registroRepository.findById(idRegistro)
            .orElseThrow(() -> new BusinessException("Prontuário não encontrado."));

        // Capturar dados antes de deletar para o log
        String detalhes = String.format("Paciente: %s (ID: %d) | Categoria: %s | Arquivo: %s | Registro ID: %d", 
                                        reg.getPaciente().getUsuario().getNome(),
                                        reg.getPaciente().getId(),
                                        reg.getCategoria().getNome(),
                                        reg.getNomeArquivoOriginal(),
                                        reg.getIdRegistro());

        // Remove arquivo físico
        Path base = Paths.get(storageDir).toAbsolutePath().normalize();
        Path caminho = base
            .resolve("paciente-" + reg.getPaciente().getId())
            .resolve(reg.getNomeArquivoStorage())
            .normalize();

        try {
            Files.deleteIfExists(caminho);
        } catch (IOException e) {
            // Logar erro, mas permitir deletar registro do banco
        }

        registroRepository.delete(reg);
        
        // Registrar log de auditoria
        auditoriaService.registrarLog("EXCLUSAO_PRONTUARIO", detalhes);
    }
}