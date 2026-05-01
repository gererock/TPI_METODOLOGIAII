package com.bodypaint.feature.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.dto.request.ProductoCreateRequestDto;
import com.bodypaint.feature.services.interfaces.IProductCreateService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
@AllArgsConstructor
public class ProductoCreateController {
    
    private final IProductCreateService servicioCreate;

    @PostMapping
public ResponseEntity<String> create(@Valid @RequestBody ProductoCreateRequestDto dto) {
    try{

        servicioCreate.cerate(dto);
        return ResponseEntity.status(201).body("Producto creado");
        
    }
    catch(RuntimeException e){

        return ResponseEntity.status(409).body(e.getMessage());

    }
}
}
