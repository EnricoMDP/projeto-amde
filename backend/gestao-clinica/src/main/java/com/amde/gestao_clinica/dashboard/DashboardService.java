package com.amde.gestao_clinica.dashboard;

import com.amde.gestao_clinica.agendamento.AgendamentoRepository;
import com.amde.gestao_clinica.usuario.FuncionarioRepository;
import com.amde.gestao_clinica.usuario.PacienteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    private final AgendamentoRepository agendamentoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final PacienteRepository pacienteRepository;

    public DashboardService(AgendamentoRepository agendamentoRepository,
                            FuncionarioRepository funcionarioRepository,
                            PacienteRepository pacienteRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public Map<String, Object> getGeneralStats(LocalDate startDate, LocalDate endDate, Long profissionalId) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        Map<String, Object> stats = new HashMap<>();

        // Total de consultas no período
        Long totalConsultas;
        if (profissionalId != null) {
            totalConsultas = agendamentoRepository.countByFuncionarioIdAndDataInicioBetween(profissionalId, start, end);
        } else {
            totalConsultas = agendamentoRepository.countByDataInicioBetween(start, end);
        }
        stats.put("totalConsultas", totalConsultas);

        // Consultas hoje
        LocalDateTime hojeInicio = LocalDate.now().atStartOfDay();
        LocalDateTime hojeEnd = LocalDate.now().atTime(23, 59, 59);
        Long consultasHoje;
        if (profissionalId != null) {
            consultasHoje = agendamentoRepository.countByFuncionarioIdAndDataInicioBetween(profissionalId, hojeInicio, hojeEnd);
        } else {
            consultasHoje = agendamentoRepository.countByDataInicioBetween(hojeInicio, hojeEnd);
        }
        stats.put("consultasHoje", consultasHoje);

        // Total de pacientes únicos atendidos
        Long totalPacientes = pacienteRepository.count();
        stats.put("totalPacientes", totalPacientes);

        // Total de profissionais ativos
        Long totalProfissionais = funcionarioRepository.count();
        stats.put("totalProfissionais", totalProfissionais);

        return stats;
    }

    public List<Map<String, Object>> getConsultasPorProfissional(LocalDate startDate, LocalDate endDate, Long profissionalId) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results;
        if (profissionalId != null) {
            results = agendamentoRepository.countConsultasPorProfissionalSingle(profissionalId, start, end);
        } else {
            results = agendamentoRepository.countConsultasPorProfissional(start, end);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("nomeProfissional", row[0]);
            item.put("totalConsultas", row[1]);
            item.put("cargo", row[2] != null ? row[2] : "Não informado");
            data.add(item);
        }

        return data;
    }

    public List<Map<String, Object>> getConsultasPorPeriodo(LocalDate startDate, LocalDate endDate, Long profissionalId) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results;
        if (profissionalId != null) {
            results = agendamentoRepository.countConsultasPorDiaSingle(profissionalId, start, end);
        } else {
            results = agendamentoRepository.countConsultasPorDia(start, end);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            item.put("data", date.format(formatter));
            item.put("total", row[1]);
            data.add(item);
        }

        return data;
    }

    public List<Map<String, Object>> getConsultasPorEspecialidade(LocalDate startDate, LocalDate endDate, Long profissionalId) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results;
        if (profissionalId != null) {
            results = agendamentoRepository.countConsultasPorEspecialidadeSingle(profissionalId, start, end);
        } else {
            results = agendamentoRepository.countConsultasPorEspecialidade(start, end);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("especialidade", row[0] != null ? row[0] : "Não informado");
            item.put("total", row[1]);
            data.add(item);
        }

        return data;
    }
}
