package com.bodypaint.feature.controllers;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.services.interfaces.IProductGetService;

import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
@AllArgsConstructor
public class ProductoGetController {

    private final IProductGetService getService;

    @GetMapping
    public ResponseEntity<?> listarProductos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {

        try {

            Page<?> productos = getService.obtenerProductos(PageRequest.of(page, size));
    
            return ResponseEntity.ok(productos);
    
        } catch (RuntimeException e) {
    
            return ResponseEntity.status(400).body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }
}
