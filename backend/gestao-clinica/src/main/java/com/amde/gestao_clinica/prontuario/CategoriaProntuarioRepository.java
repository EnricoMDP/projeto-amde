package com.amde.gestao_clinica.prontuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoriaProntuarioRepository extends JpaRepository<CategoriaProntuario, Long> {
    Optional<CategoriaProntuario> findByNome(String nome);
}