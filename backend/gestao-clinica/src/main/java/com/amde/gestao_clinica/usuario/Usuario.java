package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(unique = true, length = 14)
    private String cpf; // CPF no formato: 000.000.000-00 ou 00000000000

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_acesso", nullable = false, length = 50)
    private NivelAcesso nivelAcesso;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Paciente paciente;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Funcionario funcionario;

    private LocalDate dataNasc;

    private String pais;
    private String estado;
    private String cidade;
    private String rua;

    @Column(length = 50)
    private String numCelular;

    //Getters e Setters
    
}
