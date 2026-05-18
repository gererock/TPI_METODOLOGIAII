package com.bodypaint.feature.dto.response;

import java.time.LocalDate;
import java.util.List;

import com.bodypaint.feature.models.EstadoPedido;

public record PedidoResponse(
    Long id,
    List<ProductoEnPedido> productos,
    EstadoPedido estadoPedido,
    Double total,
    Long id_cliente,
    LocalDate fechaDePedido,
    String motivoCancelacion
) {
    // Record auxiliar para representar cada linea del pedido
    // (producto + cantidad) como objeto plano, evitando el problema
    // de serializar un Map con clave de objeto complejo.
    public record ProductoEnPedido(
        Long id,
        String nombre,
        String marca,
        Double precio,
        Integer stock,
        String foto,
        String descripcion,
        Boolean sinStock,
        Integer cantidad
    ) {}
}