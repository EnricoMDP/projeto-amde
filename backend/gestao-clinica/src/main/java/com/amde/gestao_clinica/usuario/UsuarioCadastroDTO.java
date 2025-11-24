package com.amde.gestao_clinica.usuario;

import com.amde.gestao_clinica.util.validation.Cpf;
import com.amde.gestao_clinica.util.validation.Crm;
import com.amde.gestao_clinica.util.validation.DataNascimento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// Usamos 'record' do Java 17+ para criar DTOs de forma concisa e imutável.
// As anotações @NotBlank, @Email, etc., vêm da dependência 'spring-boot-starter-validation'
// e garantem que os dados não cheguem nulos ou em formato inválido no nosso serviço.
public record UsuarioCadastroDTO(
    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Formato de email inválido")
    String email,

    @NotBlank(message = "A senha é obrigatória")
    String senha,
    
    @Cpf
    String cpf, // CPF do usuário - validação customizada
    
    @NotNull(message = "O nível de acesso é obrigatório")
    NivelAcesso nivelAcesso, // Ex: "PACIENTE", "MEDICO"

    // Informação específica do paciente, pode ser nula se o usuário não for paciente
    String descPaciente,
    
    // Grau de suporte do autismo (1, 2 ou 3) - apenas para pacientes
    Integer grauSuporte,

    // CRM para médicos/funcionários da saúde - validação customizada
    @Crm
    String crm,

    // Cargo/Especialidade (para MEDICO ou ADMINISTRADOR)
    String cargo,

    // Outros campos do usuário
    @DataNascimento
    LocalDate dataNasc,
    String pais,
    String estado,
    String cidade,
    String rua,
    String numCelular
) {}