package com.amde.gestao_clinica.usuario;

import com.amde.gestao_clinica.util.validation.Cpf;
import com.amde.gestao_clinica.util.validation.Crm;
import com.amde.gestao_clinica.util.validation.DataNascimento;
import java.time.LocalDate;

public record UsuarioAtualizacaoDTO(
        String nome,
        String email,
        @Cpf
        String cpf,
        String numCelular,
        String pais,
        String estado,
        String cidade,
        String rua,
        @DataNascimento
        LocalDate dataNasc,
        NivelAcesso nivelAcesso,
        String descPaciente, // relevante quando PACIENTE
        Integer grauSuporte, // Grau de suporte do autismo (1, 2 ou 3) - apenas para pacientes
        @Crm
        String crm // CRM para funcionários da saúde
) {}
