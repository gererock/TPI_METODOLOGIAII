package com.bodypaint.feature.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.dto.response.PedidoResponse.ProductoEnPedido;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;

public class PedidoMapper {

    public static Pedido toEntity(PedidoRequestDto dto) {
        return Pedido.builder()
                     .productos(dto.productos())
                     .total(dto.total())
                     .id_cliente(dto.id_cliente())
                     .estado(EstadoPedido.EN_PROCESO)
                     .fechaDePedido(LocalDate.now())
                     .build();
    }

    public static PedidoResponse toResponse(Pedido pd, Map<ProductoResponseDto, Integer> productosMap, String domicilioCliente) {

        List<ProductoEnPedido> productos = productosMap.entrySet().stream()
            .map(e -> new ProductoEnPedido(
                e.getKey().id(),
                e.getKey().nombre(),
                e.getKey().marca(),
                e.getKey().precio(),
                e.getKey().stock(),
                e.getKey().foto(),
                e.getKey().descripcion(),
                e.getKey().sinStock(),
                e.getValue()
            ))
            .toList();

        return new PedidoResponse(
            pd.getId(),
            productos,
            pd.getEstado(),
            pd.getTotal(),
            pd.getId_cliente(),
            domicilioCliente,
            pd.getFechaDePedido(),
            pd.getMotivoCancelacion()
        );
    }
}
