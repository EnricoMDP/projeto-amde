package com.amde.gestao_clinica.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    
    // Para facilitar a busca de agendamentos: Encontra o funcionário pelo ID do Usuário (login)
    Optional<Funcionario> findByUsuarioId(Long idUsuario);
    
    // Verificar se CRM já existe
    Optional<Funcionario> findByCrm(String crm);
    
    boolean existsByCrm(String crm);
}