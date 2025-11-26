package com.amde.gestao_clinica.dashboard;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long profissionalId) {
        
        Map<String, Object> stats = dashboardService.getGeneralStats(startDate, endDate, profissionalId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/consultas-por-profissional")
    public ResponseEntity<List<Map<String, Object>>> getConsultasPorProfissional(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long profissionalId) {
        
        List<Map<String, Object>> data = dashboardService.getConsultasPorProfissional(startDate, endDate, profissionalId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/consultas-por-periodo")
    public ResponseEntity<List<Map<String, Object>>> getConsultasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long profissionalId) {
        
        List<Map<String, Object>> data = dashboardService.getConsultasPorPeriodo(startDate, endDate, profissionalId);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/consultas-por-especialidade")
    public ResponseEntity<List<Map<String, Object>>> getConsultasPorEspecialidade(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long profissionalId) {
        
        List<Map<String, Object>> data = dashboardService.getConsultasPorEspecialidade(startDate, endDate, profissionalId);
        return ResponseEntity.ok(data);
    }
}
