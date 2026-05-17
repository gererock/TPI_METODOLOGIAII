package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.mapper.PedidoMapper;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.services.interfaces.IPedidoEstadoService;
import com.bodypaint.feature.utils.BuscarProductoPorPedido;
import com.bodypaint.feature.utils.CancelarPedido;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoEstadoService implements IPedidoEstadoService{

    private final IPedidoRepository pedidoRepository;
    private final BuscarProductoPorPedido buscarProducto;
    private final CancelarPedido cancelarPedido;
 
    @Override
    public PedidoResponse cambiarEstado(Long id, String nuevoEstado) {
 
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));
 
        // Un pedido ENTREGADO o CANCELADO es un estado final: no se puede modificar
        if (pedido.getEstado() == EstadoPedido.ENTREGADO || pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new IllegalStateException(
                "El pedido ya esta en estado " + pedido.getEstado() + " y no puede ser modificado."
            );
        }
 
        EstadoPedido estadoNuevo;
        try {
            estadoNuevo = EstadoPedido.valueOf(nuevoEstado);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado invalido: " + nuevoEstado);
        }
 
        if (estadoNuevo == EstadoPedido.CANCELADO) {
            // CancelarPedido ya se encarga de cambiar el estado, guardar y devolver el stock
            cancelarPedido.cancelarPedido(pedido, pedido.getProductos());
        } else {
            // Para ENTREGADO (u otro estado futuro) solo actualizamos el estado
            pedido.setEstado(estadoNuevo);
            pedidoRepository.save(pedido);
        }
 
        return PedidoMapper.toResponse(pedido, buscarProducto.buscarMap(pedido.getProductos()));
    }
    
}
