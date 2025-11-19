package com.amde.gestao_clinica.agendamento;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendaPacienteRepository extends JpaRepository<AgendaPaciente, Long> {
}