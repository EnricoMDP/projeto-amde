package com.amde.gestao_clinica.agendamento;

import com.amde.gestao_clinica.usuario.Paciente;
import jakarta.persistence.*;

@Entity
@Table(name = "agenda_paciente")
public class AgendaPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agenda_paciente")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agenda", nullable = false)
    private Agendamento agendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "presenca_paciente")
    private Boolean presencaPaciente = false;
    
    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Agendamento getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(Agendamento agendamento) {
        this.agendamento = agendamento;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Boolean getPresencaPaciente() {
        return presencaPaciente;
    }

    public void setPresencaPaciente(Boolean presencaPaciente) {
        this.presencaPaciente = presencaPaciente;
    }
}