package com.bodypaint.feature.Config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.Config.errors.ProductoYaExisteException;

@RestControllerAdvice
public class CustomExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        });

        // 🔥 tomar el primer error como mensaje principal
        String mainMessage = ex.getBindingResult()
                            .getFieldErrors()
                            .stream()
                            .findFirst()
                            .map(err -> err.getDefaultMessage())
                            .orElse("Error de validación");

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("message", mainMessage);
        response.put("errors", fieldErrors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralErrors(Exception ex) {

        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ProductoYaExisteException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(ProductoYaExisteException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 409);
        response.put("message", ex.getMessage());
        response.put("errors", null);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 404);
        response.put("message", ex.getMessage());
        response.put("errors", null);
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
}
