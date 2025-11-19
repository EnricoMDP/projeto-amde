package com.amde.gestao_clinica.agendamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AgendamentoAtualizacaoDTO(
    @NotNull(message = "O ID do funcionário é obrigatório.")
    Long idFuncionario,

    @NotNull(message = "A data e hora de início são obrigatórias.")
    LocalDateTime dataInicio,

    @NotNull(message = "A data e hora final são obrigatórias.")
    LocalDateTime dataFinal,

    @NotBlank(message = "O status é obrigatório.")
    String status,

    @NotBlank(message = "O tipo de agendamento é obrigatório.")
    String tipoAgendamento,

    @NotNull(message = "O ID do paciente é obrigatório.")
    Long idPaciente
) {}