package com.amde.gestao_clinica.usuario;

import java.util.ArrayList;

import com.amde.gestao_clinica.prontuario.HistoricoProntuario;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario", unique = true, nullable = false)
    private Usuario usuario;

    @Column(name = "desc_paciente")
    private String descricao;
    
    @Column(name = "prontuario_recente")
    private Integer prontuarioRecente;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoricoProntuario> historicoProntuarios = new ArrayList<>();

    //Getter e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getProntuarioRecente() {
        return prontuarioRecente;
    }

    public void setProntuarioRecente(Integer prontuarioRecente) {
        this.prontuarioRecente = prontuarioRecente;
    }

    public List<HistoricoProntuario> getHistoricoProntuarios() {
        return historicoProntuarios;
    }

    public void setHistoricoProntuarios(List<HistoricoProntuario> historicoProntuarios) {
        this.historicoProntuarios = historicoProntuarios;
    }    
}