package com.amde.gestao_clinica.logger;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditoriaService {

    private final LogAuditoriaRepository logRepository;

    public AuditoriaService(LogAuditoriaRepository logRepository) {
        this.logRepository = logRepository;
    }

    /**
     * Registra um log de auditoria no banco de dados.
     * 
     * @param acao Tipo da ação realizada (ex: "LOGIN", "CADASTRO_PACIENTE")
     * @param detalhes Informações adicionais sobre a ação (payload, ID do recurso, etc.)
     */
    @Transactional
    public void registrarLog(String acao, String detalhes) {
        LogAuditoria log = new LogAuditoria();
        
        // Obtém o usuário do contexto de segurança
        String usuario = obterUsuarioLogado();
        
        log.setUsuario(usuario);
        log.setAcao(acao);
        log.setDetalhes(detalhes);
        log.setDataHora(LocalDateTime.now());
        
        logRepository.save(log);
    }

    /**
     * Obtém o email/username do usuário atualmente autenticado.
     * Retorna "ANONIMO" se não houver usuário autenticado.
     */
    private String obterUsuarioLogado() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() 
                && !(authentication.getPrincipal() instanceof String && 
                     "anonymousUser".equals(authentication.getPrincipal()))) {
                return authentication.getName(); // Retorna o email do usuário
            }
        } catch (Exception e) {
            // Em caso de erro, loga como anônimo
            return "ANONIMO";
        }
        
        return "ANONIMO";
    }
}
