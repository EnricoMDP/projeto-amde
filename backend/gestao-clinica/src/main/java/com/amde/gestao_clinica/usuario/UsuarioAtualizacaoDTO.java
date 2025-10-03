package com.amde.gestao_clinica.usuario;

import java.time.LocalDate;

public record UsuarioAtualizacaoDTO(
        String nome,
        String email,
        String numCelular,
        String pais,
        String estado,
        String cidade,
        String rua,
        LocalDate dataNasc,
        NivelAcesso nivelAcesso,
        String descPaciente // relevante quando PACIENTE
) {}
