package com.amde.gestao_clinica.prontuario;
import com.amde.gestao_clinica.usuario.Paciente;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registro_prontuario")
public class RegistroProntuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Long idRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "titulo_documento", nullable = false)
    private String tituloDocumento;

    @Column(name = "nome_arquivo_original", nullable = false)
    private String nomeArquivoOriginal;

    @Column(name = "nome_arquivo_storage", nullable = false)
    private String nomeArquivoStorage;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_registro_substituido")
    private RegistroProntuario registroSubstituido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private CategoriaProntuario categoria;
    
    // Getters e Setters...

    public Long getIdRegistro() {
        return idRegistro;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public String getTituloDocumento() {
        return tituloDocumento;
    }

    public String getNomeArquivoOriginal() {
        return nomeArquivoOriginal;
    }

    public String getNomeArquivoStorage() {
        return nomeArquivoStorage;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public RegistroProntuario getRegistroSubstituido() {
        return registroSubstituido;
    }

    public CategoriaProntuario getCategoria() {
        return categoria;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public void setTituloDocumento(String tituloDocumento) {
        this.tituloDocumento = tituloDocumento;
    }

    public void setNomeArquivoOriginal(String nomeArquivoOriginal) {
        this.nomeArquivoOriginal = nomeArquivoOriginal;
    }

    public void setNomeArquivoStorage(String nomeArquivoStorage) {
        this.nomeArquivoStorage = nomeArquivoStorage;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public void setRegistroSubstituido(RegistroProntuario registroSubstituido) {
        this.registroSubstituido = registroSubstituido;
    }

    public void setCategoria(CategoriaProntuario categoria) {
        this.categoria = categoria;
    }

    


}
