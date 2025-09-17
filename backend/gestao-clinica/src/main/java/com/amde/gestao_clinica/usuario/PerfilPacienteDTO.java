package com.amde.gestao_clinica.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilPacienteDTO {
    private UsuarioDTO usuario;      // dados pessoais já existentes (reúso do UsuarioDTO)
    private String descricao;        // desc_paciente
    private List<ProntuarioDTO> prontuarios; // lista completa de prontuários
}
