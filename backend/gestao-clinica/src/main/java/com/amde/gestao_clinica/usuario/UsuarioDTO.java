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
    private Integer grauSuporte; // Grau de suporte do autismo (1, 2 ou 3) - apenas para pacientes
    private String cargo; // Especialidade (MEDICO) ou Cargo (ADMINISTRADOR)
    private String cpf; // CPF do usuário (para PACIENTE)
    private String crm; // CRM do funcionário (para MEDICO)
}
