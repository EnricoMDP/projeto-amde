package com.amde.gestao_clinica.util.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotação customizada para validação de CPF.
 * Valida o formato e os dígitos verificadores do CPF brasileiro.
 */
@Documented
@Constraint(validatedBy = CpfValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Cpf {
    
    String message() default "CPF inválido. Digite um CPF válido no formato 000.000.000-00";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
