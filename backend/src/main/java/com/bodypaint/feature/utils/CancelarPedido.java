package com.bodypaint.feature.utils;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.models.EstadoPedido;
import com.bodypaint.feature.models.Pedido;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IPedidoRepository;
import com.bodypaint.feature.repository.IProductoRepository;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class CancelarPedido {
    private final IProductoRepository productoRepository;
    private final IPedidoRepository pedidoRepository;

    public void cancelarPedido(Pedido pedido, Map<Long,Integer> map, String motivoCancelacion){

        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setMotivoCancelacion(motivoCancelacion);

        pedidoRepository.save(pedido);

        map.forEach((id, cantidad)->{

            Producto producto = productoRepository.findById(id).orElseThrow(()-> new NotFoundException("Productos no encontrado"));
            
            if(producto.getSinStock()){
                producto.setSinStock(false);
            }


            producto.setStock(producto.getStock()+cantidad);
        
            productoRepository.save(producto);
        }
        );

    }
}
