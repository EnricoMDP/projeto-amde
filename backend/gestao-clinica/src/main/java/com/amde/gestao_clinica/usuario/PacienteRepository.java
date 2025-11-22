package com.amde.gestao_clinica.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
	// Permite buscar Paciente pelo ID do Usuario associado (id_usuario)
	Optional<Paciente> findByUsuarioId(Long idUsuario);
}