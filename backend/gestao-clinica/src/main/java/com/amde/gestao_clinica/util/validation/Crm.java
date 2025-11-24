package com.amde.gestao_clinica.util.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotação customizada para validação de CRM (Conselho Regional de Medicina).
 * Valida o formato do CRM: 6 a 8 dígitos opcionalmente seguidos de /UF.
 * Exemplos válidos: "123456", "12345678", "123456/SP", "12345678/RJ"
 */
@Documented
@Constraint(validatedBy = CrmValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Crm {
    
    String message() default "CRM inválido. Digite no formato 123456/UF (ex: 123456/SP)";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
