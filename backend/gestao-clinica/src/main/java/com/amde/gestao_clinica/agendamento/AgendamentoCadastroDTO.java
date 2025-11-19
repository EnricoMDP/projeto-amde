package com.amde.gestao_clinica.agendamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

// DTO para o Frontend criar um agendamento
public record AgendamentoCadastroDTO(
    @NotNull(message = "O ID do funcionário é obrigatório.")
    Long idFuncionario,

    @NotNull(message = "A data e hora de início são obrigatórias.")
    LocalDateTime dataInicio,

    @NotNull(message = "A data e hora final são obrigatórias.")
    LocalDateTime dataFinal,

    @NotBlank(message = "O tipo de agendamento é obrigatório.")
    String tipoAgendamento,

    // ID do paciente (por enquanto, assumimos 1:1, mas o banco é 1:N)
    @NotNull(message = "O ID do paciente é obrigatório.")
    Long idPaciente
) {}