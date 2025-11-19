package com.amde.gestao_clinica.agendamento;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    // Para a feature Dashboard: Consultas por Período
    List<Agendamento> findByDataInicioBetween(LocalDateTime start, LocalDateTime end);

    // Para evitar conflito: Busca agendamentos de um funcionário que se sobrepõem
    List<Agendamento> findByFuncionarioIdAndDataFinalAfterAndDataInicioBefore(
        Long idFuncionario, 
        LocalDateTime dataInicio, 
        LocalDateTime dataFinal
    );
}