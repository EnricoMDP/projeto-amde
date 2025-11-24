package com.amde.gestao_clinica.util.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validação personalizada para data de nascimento.
 * Garante que a data está entre 150 anos atrás e 6 meses atrás (apenas datas passadas).
 */
@Documented
@Constraint(validatedBy = DataNascimentoValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataNascimento {
    String message() default "Data de nascimento inválida. A data deve estar entre 150 anos atrás e 6 meses atrás";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
