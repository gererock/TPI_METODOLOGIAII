package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.mapper.PedidoMapper;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.services.interfaces.IPedidoGenerateService;
import com.bodypaint.feature.utils.BuscarProductoPorPedido;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoGeneratedService implements IPedidoGenerateService{
    
    private final IPedidoRepository pedidoRepository;
    private final BuscarProductoPorPedido buscarProducto;
    
    @Override
    public PedidoResponse generar(PedidoRequestDto pd) {
        
        Pedido pedidoGenerado = PedidoMapper.toEntity(pd);

        pedidoRepository.save(pedidoGenerado);

        return PedidoMapper.toResponse(pedidoGenerado, buscarProducto.buscarMap(pedidoGenerado.getProductos()));

    }

}
