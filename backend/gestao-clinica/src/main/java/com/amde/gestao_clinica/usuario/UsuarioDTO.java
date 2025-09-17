package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long idUsuario;
    private String email;
    private String nome;
    private NivelAcesso nivelAcesso;
    private LocalDate dataNasc;
    private String pais;
    private String estado;
    private String cidade;
    private String rua;
    private String numCelular;
}
