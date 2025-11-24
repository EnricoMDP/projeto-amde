package com.amde.gestao_clinica.exception;

import com.amde.gestao_clinica.usuario.BusinessException;
import com.amde.gestao_clinica.usuario.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", "Erro de Validação");
        
        // Captura todas as mensagens de erro de validação
        String mensagens = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        
        body.put("message", mensagens);
        
        // Adiciona detalhes dos campos com erro (opcional, útil para debug)
        Map<String, String> errosPorCampo = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errosPorCampo.put(error.getField(), error.getDefaultMessage());
        }
        body.put("campos", errosPorCampo);
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Object> handleBusiness(BusinessException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", "Business Error");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("error", "Erro de Duplicação");
        
        // Extrai a mensagem técnica
        String mensagemTecnica = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        String mensagemAmigavel;
        
        // Traduz erros de constraint para mensagens amigáveis
        if (mensagemTecnica != null) {
            if (mensagemTecnica.contains("usuario_email_key") || mensagemTecnica.contains("duplicate key") && mensagemTecnica.toLowerCase().contains("email")) {
                mensagemAmigavel = "Este email já está cadastrado no sistema";
            } else if (mensagemTecnica.contains("usuario_cpf_key") || mensagemTecnica.contains("duplicate key") && mensagemTecnica.toLowerCase().contains("cpf")) {
                mensagemAmigavel = "Este CPF já está cadastrado no sistema";
            } else if (mensagemTecnica.contains("funcionarios_crm_key") || mensagemTecnica.contains("duplicate key") && mensagemTecnica.toLowerCase().contains("crm")) {
                mensagemAmigavel = "Este CRM já está cadastrado no sistema";
            } else if (mensagemTecnica.contains("duplicate key")) {
                mensagemAmigavel = "Este registro já existe no sistema";
            } else if (mensagemTecnica.contains("foreign key") || mensagemTecnica.contains("violates foreign key constraint")) {
                mensagemAmigavel = "Não é possível realizar esta operação pois existem registros relacionados";
            } else {
                mensagemAmigavel = "Erro ao salvar os dados. Verifique se as informações não estão duplicadas";
            }
        } else {
            mensagemAmigavel = "Erro ao salvar os dados. Verifique se as informações não estão duplicadas";
        }
        
        body.put("message", mensagemAmigavel);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }
}
