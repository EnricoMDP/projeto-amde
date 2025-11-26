package com.amde.gestao_clinica.agendamento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Métodos para Dashboard - Contagem de consultas
    Long countByFuncionarioIdAndDataInicioBetween(Long funcionarioId, LocalDateTime start, LocalDateTime end);
    
    Long countByDataInicioBetween(LocalDateTime start, LocalDateTime end);

    // Consultas por profissional - Single (para um profissional específico)
    @Query("SELECT f.usuario.nome, COUNT(a), f.cargo " +
           "FROM Agendamento a " +
           "JOIN a.funcionario f " +
           "WHERE a.funcionario.id = :profissionalId " +
           "AND a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY f.id, f.usuario.nome, f.cargo " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countConsultasPorProfissionalSingle(
        @Param("profissionalId") Long profissionalId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Consultas por profissional - Todos
    @Query("SELECT f.usuario.nome, COUNT(a), f.cargo " +
           "FROM Agendamento a " +
           "JOIN a.funcionario f " +
           "WHERE a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY f.id, f.usuario.nome, f.cargo " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countConsultasPorProfissional(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Consultas por dia - Single (para um profissional específico)
    @Query("SELECT CAST(a.dataInicio AS date), COUNT(a) " +
           "FROM Agendamento a " +
           "WHERE a.funcionario.id = :profissionalId " +
           "AND a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY CAST(a.dataInicio AS date) " +
           "ORDER BY CAST(a.dataInicio AS date)")
    List<Object[]> countConsultasPorDiaSingle(
        @Param("profissionalId") Long profissionalId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Consultas por dia - Todos
    @Query("SELECT CAST(a.dataInicio AS date), COUNT(a) " +
           "FROM Agendamento a " +
           "WHERE a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY CAST(a.dataInicio AS date) " +
           "ORDER BY CAST(a.dataInicio AS date)")
    List<Object[]> countConsultasPorDia(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Consultas por especialidade - Single (para um profissional específico)
    @Query("SELECT f.cargo, COUNT(a) " +
           "FROM Agendamento a " +
           "JOIN a.funcionario f " +
           "WHERE a.funcionario.id = :profissionalId " +
           "AND a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY f.cargo " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countConsultasPorEspecialidadeSingle(
        @Param("profissionalId") Long profissionalId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    // Consultas por especialidade - Todos
    @Query("SELECT f.cargo, COUNT(a) " +
           "FROM Agendamento a " +
           "JOIN a.funcionario f " +
           "WHERE a.dataInicio BETWEEN :start AND :end " +
           "GROUP BY f.cargo " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countConsultasPorEspecialidade(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}