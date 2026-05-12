package com.bodypaint.feature.dto.request;

import java.util.Map;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record  PedidoRequestDto (
    
    @NotNull(message="El pedido debe contener productos")
    Map<Long, Integer> productos,

    @NotNull
    @Positive
    Double total,

    Long id_cliente


){

}
