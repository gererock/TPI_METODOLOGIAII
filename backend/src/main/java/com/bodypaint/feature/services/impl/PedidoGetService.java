package com.bodypaint.feature.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.mapper.PedidoMapper;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.services.interfaces.IPedidoGetService;
import com.bodypaint.feature.utils.BuscarProductoPorPedido;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoGetService implements IPedidoGetService{
    
    private final IPedidoRepository pedidoRepository;
    private final BuscarProductoPorPedido buscarProducto;
    
    
    @Override
    public PedidoResponse getById(Long id) {
        
        Pedido pedidoEncontrado = pedidoRepository.findById(id).orElseThrow(()-> new NotFoundException("Pedido No encontrado"));

        return PedidoMapper.toResponse(pedidoEncontrado, buscarProducto.buscarMap(pedidoEncontrado.getProductos()));
    }

    @Override
    public List<PedidoResponse> getAll() {

        List<Pedido> pedidos = pedidoRepository.findAll();

        return pedidos.stream()
                      .map(pedido -> PedidoMapper.toResponse(
                            pedido,
                            buscarProducto.buscarMap(pedido.getProductos())
                       ))
                      .toList();
    }
}
    
