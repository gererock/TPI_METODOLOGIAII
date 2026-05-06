package com.bodypaint.feature.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.ProductoCreateRequestDto;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
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
public ResponseEntity<BaseResponse<ProductoResponseDto>> create(@Valid @RequestBody ProductoCreateRequestDto dto) {

    servicioCreate.cerate(dto);

    return ResponseEntity.status(HttpStatus.CREATED).body(
        BaseResponse.noContent("Producto Creado Correctamente")
    );
}

}
