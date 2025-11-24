package com.amde.gestao_clinica.util.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

/**
 * Validador para data de nascimento.
 * Aceita apenas datas passadas entre 6 meses atrás e 150 anos atrás.
 */
public class DataNascimentoValidator implements ConstraintValidator<DataNascimento, LocalDate> {
    
    private static final int ANOS_MAXIMO_PASSADO = 150;
    private static final int MESES_MINIMO_PASSADO = 6;
    
    @Override
    public void initialize(DataNascimento constraintAnnotation) {
        // Nenhuma inicialização necessária
    }
    
    @Override
    public boolean isValid(LocalDate dataNascimento, ConstraintValidatorContext context) {
        // Permite null - use @NotNull separadamente se o campo for obrigatório
        if (dataNascimento == null) {
            return true;
        }
        
        LocalDate hoje = LocalDate.now();
        LocalDate dataMinima = hoje.minusYears(ANOS_MAXIMO_PASSADO); // 150 anos atrás
        LocalDate dataMaxima = hoje.minusMonths(MESES_MINIMO_PASSADO); // 6 meses atrás
        
        // Valida se a data está dentro do intervalo permitido (passado)
        boolean dataValida = !dataNascimento.isBefore(dataMinima) && !dataNascimento.isAfter(dataMaxima);
        
        if (!dataValida) {
            // Personaliza a mensagem de erro com as datas permitidas
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                String.format("Data de nascimento deve estar entre %s e %s (apenas datas passadas)", 
                    dataMinima.toString(), 
                    dataMaxima.toString())
            ).addConstraintViolation();
        }
        
        return dataValida;
    }
}
