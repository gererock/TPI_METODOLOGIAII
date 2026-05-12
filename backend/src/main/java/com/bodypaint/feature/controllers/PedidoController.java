package com.bodypaint.feature.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.services.interfaces.IPedidoGenerateService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/pedidos")
@AllArgsConstructor
public class PedidoController {

    private final IPedidoGenerateService generatedService;
    
    @PostMapping("/generar")
    public ResponseEntity<BaseResponse<?>> generar(@Valid @RequestBody PedidoRequestDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
            BaseResponse.ok(generatedService.generar(dto), "Pedido generado con exito")
        );

    }
    
}
