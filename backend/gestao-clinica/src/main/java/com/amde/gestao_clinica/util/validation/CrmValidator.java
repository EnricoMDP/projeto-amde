package com.amde.gestao_clinica.util.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validador customizado para CRM (Conselho Regional de Medicina).
 * Valida o formato e a UF brasileira do CRM.
 * 
 * Exemplos válidos:
 * - "123456" (sem UF - será completado pelo frontend)
 * - "123456/SP" (com UF válida)
 * - "12345678/RJ" (8 dígitos com UF válida)
 * 
 * Exemplos inválidos:
 * - "123456/FF" (UF não existe)
 * - "123456/ZZ" (UF fictícia)
 */
public class CrmValidator implements ConstraintValidator<Crm, String> {

    // Lista completa de todas as UFs brasileiras válidas (26 estados + DF)
    private static final Set<String> UFS_VALIDAS = Set.of(
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
        "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
        "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    );

    // Regex: 6 a 8 dígitos numéricos opcionalmente seguidos por / e duas letras maiúsculas
    private static final Pattern CRM_PATTERN = Pattern.compile("^\\d{6,8}(/[A-Z]{2})?$");

    @Override
    public void initialize(Crm constraintAnnotation) {
        // Método de inicialização - não precisa de implementação neste caso
    }

    @Override
    public boolean isValid(String crm, ConstraintValidatorContext context) {
        // CRM nulo ou vazio é considerado válido (use @NotBlank para obrigatoriedade)
        if (crm == null || crm.isBlank()) {
            return true;
        }

        // Remove espaços em branco
        String crmLimpo = crm.trim();

        // Valida formato básico (6-8 dígitos + /UF opcional)
        if (!CRM_PATTERN.matcher(crmLimpo).matches()) {
            return false;
        }

        // Se tem UF, valida se é uma UF brasileira válida
        if (crmLimpo.contains("/")) {
            String uf = crmLimpo.substring(crmLimpo.indexOf("/") + 1);
            return UFS_VALIDAS.contains(uf);
        }

        // CRM sem UF é válido (formato antigo ou será completado pelo frontend)
        return true;
    }
}
