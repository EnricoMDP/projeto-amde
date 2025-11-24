package com.amde.gestao_clinica.logger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    // Métodos de consulta personalizados podem ser adicionados aqui se necessário
    // Por exemplo: List<LogAuditoria> findByUsuario(String usuario);
}
