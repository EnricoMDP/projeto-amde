package com.amde.gestao_clinica.usuario;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

import com.amde.gestao_clinica.prontuario.RegistroProntuario;


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

    @Column(name = "grau_suporte")
    private Integer grauSuporte; // Novo campo

    // Alterado: Tipo mudou para RegistroProntuario e nome da variável para minúsculo
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RegistroProntuario> registroProntuarios = new ArrayList<>();

    // --- Getters e Setters ---

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

    // REMOVIDOS: getProntuarioRecente e setProntuarioRecente (pois o campo não existe mais)

    public List<RegistroProntuario> getRegistroProntuarios() {
        return registroProntuarios;
    }

    public void setRegistroProntuarios(List<RegistroProntuario> registroProntuarios) {
        this.registroProntuarios = registroProntuarios;
    }
    
    public Integer getGrauSuporte() {
        return grauSuporte;
    }

    public void setGrauSuporte(Integer grauSuporte) {
        this.grauSuporte = grauSuporte;
    }


}

