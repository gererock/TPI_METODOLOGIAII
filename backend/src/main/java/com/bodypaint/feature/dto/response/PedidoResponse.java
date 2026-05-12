package com.bodypaint.feature.dto.response;

import java.util.Map;

import com.bodypaint.feature.models.EstadoPedido;

public record PedidoResponse(
    Long id,

    Map<ProductoResponseDto, Integer> productos,

    EstadoPedido estadoPedido,

    Double total,

    Long id_cliente

) {
    
}
