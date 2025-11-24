package com.amde.gestao_clinica.logger;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log")
    private Long idLog;

    @Column(name = "usuario", nullable = false, length = 255)
    private String usuario; // Email ou login do usuário logado

    @Column(name = "acao", nullable = false, length = 100)
    private String acao; // Ex: "LOGIN", "CADASTRO_PACIENTE", "UPLOAD_PRONTUARIO"

    @Column(name = "detalhes", columnDefinition = "TEXT")
    private String detalhes; // Payload ou ID do recurso afetado

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    // Getters e Setters

    public Long getIdLog() {
        return idLog;
    }

    public void setIdLog(Long idLog) {
        this.idLog = idLog;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getAcao() {
        return acao;
    }

    public void setAcao(String acao) {
        this.acao = acao;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
