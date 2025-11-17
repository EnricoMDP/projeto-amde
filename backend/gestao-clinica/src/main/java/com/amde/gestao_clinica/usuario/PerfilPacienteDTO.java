package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilPacienteDTO {
    private UsuarioDTO usuario;
    private String descricao;
    private Integer grauSuporte; // Novo campo
    private List<ProntuarioDTO> prontuarios;
}