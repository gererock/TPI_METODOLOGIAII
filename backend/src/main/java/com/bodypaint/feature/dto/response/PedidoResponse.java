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
    String domicilioCliente,
    LocalDate fechaDePedido,
    String motivoCancelacion
) {
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
