package com.amde.gestao_clinica.prontuario;
import com.amde.gestao_clinica.usuario.Paciente;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_prontuario")
public class HistoricoProntuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prontuario")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "nome_arquivo", nullable = false)
    private String nomeArquivo;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;
    
    // Getters e Setters...

    public Long getId() {
        return id;
    }

     public Paciente getPaciente() {
        return paciente;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }


}
