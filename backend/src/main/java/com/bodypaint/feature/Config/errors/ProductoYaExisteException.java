package com.bodypaint.feature.Config.errors;

public class ProductoYaExisteException extends RuntimeException {
    public ProductoYaExisteException(String msg) { 
        super(msg); 
    }
}
