package com.bodypaint.feature.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.services.interfaces.IPedidoGenerateService;
import com.bodypaint.feature.services.interfaces.IPedidoGetService;

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

    private final IPedidoGetService getService;

    @GetMapping()
    public ResponseEntity<BaseResponse<?>> getAllPedidos(){
        return ResponseEntity.ok().body(
            BaseResponse.ok(
                getService.getAll(), "Todos los pedidos traidos completamente.")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<?>> getForIdPedido(
        @PathVariable Long id
    ){
        return ResponseEntity.ok().body(
            BaseResponse.ok(
                getService.getById(id),
                "El pedido a sido encontrado con exito"
            )
        );
    }
    
}
