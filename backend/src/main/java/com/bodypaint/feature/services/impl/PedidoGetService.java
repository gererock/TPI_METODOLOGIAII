package com.bodypaint.feature.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.PedidoResponse;
import com.bodypaint.feature.mapper.PedidoMapper;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.services.interfaces.IPedidoGetService;
import com.bodypaint.feature.utils.BuscarProductoPorPedido;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PedidoGetService implements IPedidoGetService {

    private final IPedidoRepository pedidoRepository;
    private final BuscarProductoPorPedido buscarProducto;
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
    public PedidoResponse getById(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Pedido No encontrado"));
        String domicilio = armarDomicilio(pedido.getId_cliente());
        return PedidoMapper.toResponse(pedido, buscarProducto.buscarMap(pedido.getProductos()), domicilio);
    }

    @Override
    public List<PedidoResponse> getAll() {
        return pedidoRepository.findAll().stream()
            .map(pedido -> PedidoMapper.toResponse(
                pedido,
                buscarProducto.buscarMap(pedido.getProductos()),
                armarDomicilio(pedido.getId_cliente())
            ))
            .toList();
    }
}
