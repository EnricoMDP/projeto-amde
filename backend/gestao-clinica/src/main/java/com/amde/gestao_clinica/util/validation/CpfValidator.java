package com.amde.gestao_clinica.util.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validador customizado para CPF brasileiro.
 * Implementa a validação dos dígitos verificadores usando o algoritmo Módulo 11.
 */
public class CpfValidator implements ConstraintValidator<Cpf, String> {

    @Override
    public void initialize(Cpf constraintAnnotation) {
        // Método de inicialização - não precisa de implementação neste caso
    }

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        // CPF nulo ou vazio é considerado válido (use @NotBlank para obrigatoriedade)
        if (cpf == null || cpf.isBlank()) {
            return true;
        }

        // Remove caracteres não numéricos (pontos, traços, espaços)
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");

        // Verifica se tem exatamente 11 dígitos
        if (cpfLimpo.length() != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
        if (cpfLimpo.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Calcula e valida os dígitos verificadores
        return validarDigitosVerificadores(cpfLimpo);
    }

    /**
     * Valida os dois dígitos verificadores do CPF usando o algoritmo Módulo 11.
     * 
     * @param cpf CPF com 11 dígitos numéricos
     * @return true se os dígitos verificadores estão corretos
     */
    private boolean validarDigitosVerificadores(String cpf) {
        try {
            // Primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito >= 10) {
                primeiroDigito = 0;
            }

            // Verifica o primeiro dígito
            if (primeiroDigito != Character.getNumericValue(cpf.charAt(9))) {
                return false;
            }

            // Segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            int segundoDigito = 11 - (soma % 11);
            if (segundoDigito >= 10) {
                segundoDigito = 0;
            }

            // Verifica o segundo dígito
            return segundoDigito == Character.getNumericValue(cpf.charAt(10));

        } catch (Exception e) {
            return false;
        }
    }
}
