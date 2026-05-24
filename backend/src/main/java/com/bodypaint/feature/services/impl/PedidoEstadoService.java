package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.mapper.PedidoMapper;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.services.interfaces.IPedidoEstadoService;
import com.bodypaint.feature.utils.BuscarProductoPorPedido;
import com.bodypaint.feature.utils.CancelarPedido;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoEstadoService implements IPedidoEstadoService {

    private final IPedidoRepository pedidoRepository;
    private final BuscarProductoPorPedido buscarProducto;
    private final CancelarPedido cancelarPedido;
    private final IClientreRepository clienteRepository;

    private String armarDomicilio(Long idCliente) {
        if (idCliente == null) return "-";
        return clienteRepository.findById(idCliente)
            .map(c -> {
                StringBuilder sb = new StringBuilder();
                if (c.getCalle() != null)    sb.append(c.getCalle());
                if (c.getAltura() != null)   sb.append(" ").append(c.getAltura());
                if (c.getPiso() != null)     sb.append(", Piso ").append(c.getPiso());
                if (c.getDepartamento() != null && !c.getDepartamento().isBlank())
                                             sb.append(" Dto. ").append(c.getDepartamento());
                if (c.getLocalidad() != null) sb.append(", ").append(c.getLocalidad());
                if (c.getProvincia() != null) sb.append(", ").append(c.getProvincia());
                if (c.getCodigoPostal() != null) sb.append(" (CP ").append(c.getCodigoPostal()).append(")");
                return sb.toString().trim();
            })
            .orElse("-");
    }

    @Override
    public PedidoResponse cambiarEstado(Long id, String nuevoEstado, String motivoCancelacion) {

        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

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
            if (motivoCancelacion == null || motivoCancelacion.isBlank()) {
                throw new IllegalArgumentException("Debe indicar el motivo de cancelacion.");
            }
            cancelarPedido.cancelarPedido(pedido, pedido.getProductos(), motivoCancelacion);
        } else {
            pedido.setEstado(estadoNuevo);
            pedidoRepository.save(pedido);
        }

        return PedidoMapper.toResponse(
            pedido,
            buscarProducto.buscarMap(pedido.getProductos()),
            armarDomicilio(pedido.getId_cliente())
        );
    }
}
