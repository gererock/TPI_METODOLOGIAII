package com.bodypaint.feature.mapper;

import java.time.LocalDate;
import java.util.Map;

import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;

public class PedidoMapper {
    
    public static Pedido toEntity(PedidoRequestDto dto){
        return Pedido.builder()
                     .productos(dto.productos())
                     .total(dto.total())
                     .id_cliente(dto.id_cliente())
                     .estado(EstadoPedido.EN_PROCESO)
                     .fechaDePedido(LocalDate.now())
                     .build();
    }

    public static PedidoResponse toResponse(Pedido pd, Map<ProductoResponseDto, Integer> productos){
        return new PedidoResponse(pd.getId(),
                                  productos,
                                  pd.getEstado(), 
                                  pd.getTotal(), 
                                  pd.getId_cliente());
    }


}
