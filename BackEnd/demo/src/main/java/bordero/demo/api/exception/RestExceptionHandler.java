package bordero.demo.api.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        String errorMessage = "Já existe um cadastro com um dos valores informados (provavelmente CNPJ ou Nome).";

        // Tenta extrair a causa raiz para uma mensagem mais específica
        Throwable cause = ex.getRootCause();
        if (cause != null && cause.getMessage() != null) {
            String causeMessage = cause.getMessage().toLowerCase();
            if (causeMessage.contains("violates unique constraint") || causeMessage.contains("uk_")) {
                 if (causeMessage.contains("cnpj")) {
                    errorMessage = "Já existe um cadastro com este CNPJ.";
                 } else if (causeMessage.contains("nome")) {
                    errorMessage = "Já existe um cadastro com este Nome.";
                 }
            }
        }
        
        // Retorna o status HTTP 409 (Conflict) com a mensagem de erro clara
        return new ResponseEntity<>(errorMessage, HttpStatus.CONFLICT);
    }
}