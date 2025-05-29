package com.amde.gestao_clinica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCadastroDTO {
    private String email;
    private String senha;
    private String nome;
    private String nivelAcesso;
    private LocalDate dataNasc;
    private String pais;
    private String estado;
    private String cidade;
    private String rua;
    private String numCelular;
}
