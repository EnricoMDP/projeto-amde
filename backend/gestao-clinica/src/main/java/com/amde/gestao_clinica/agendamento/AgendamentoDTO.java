package com.amde.gestao_clinica.agendamento;

import com.amde.gestao_clinica.usuario.UsuarioDTO;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO para a API retornar a lista de agendamentos
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendamentoDTO {
    private Long id;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFinal;
    private String status;
    private String tipoAgendamento;
    private Boolean presencaFuncionario;

    // Dados do funcionário e paciente simplificados para exibição
    private String nomeFuncionario;
    private Long idFuncionario;
    private String cargoFuncionario; // Especialidade do médico
    private String nomePaciente;
    private Long idPaciente;
}