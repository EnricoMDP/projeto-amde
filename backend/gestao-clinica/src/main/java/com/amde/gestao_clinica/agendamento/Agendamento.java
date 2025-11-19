package com.amde.gestao_clinica.agendamento;

import com.amde.gestao_clinica.usuario.Funcionario;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agenda")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario", nullable = false)
    private Funcionario funcionario; // Médico ou profissional que atende

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_final", nullable = false)
    private LocalDateTime dataFinal;

    @Column(name = "status", length = 50)
    private String status; // Ex: "Agendado", "Concluído", "Cancelado"

    @Column(name = "presenca_funcionario")
    private Boolean presencaFuncionario = false;

    @Column(name = "tipo_agendamento", length = 100)
    private String tipoAgendamento; // Ex: "Consulta", "Exame", "Reunião"

    // Relacionamento com AgendaPaciente (para múltiplos pacientes)
    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<AgendaPaciente> pacientesAgendados = new java.util.ArrayList<>();
    
    // Getters e Setters (pode usar Lombok @Data, se preferir)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFinal() {
        return dataFinal;
    }

    public void setDataFinal(LocalDateTime dataFinal) {
        this.dataFinal = dataFinal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getPresencaFuncionario() {
        return presencaFuncionario;
    }

    public void setPresencaFuncionario(Boolean presencaFuncionario) {
        this.presencaFuncionario = presencaFuncionario;
    }

    public String getTipoAgendamento() {
        return tipoAgendamento;
    }

    public void setTipoAgendamento(String tipoAgendamento) {
        this.tipoAgendamento = tipoAgendamento;
    }

    public java.util.List<AgendaPaciente> getPacientesAgendados() {
        return pacientesAgendados;
    }

    public void setPacientesAgendados(java.util.List<AgendaPaciente> pacientesAgendados) {
        this.pacientesAgendados = pacientesAgendados;
    }
}