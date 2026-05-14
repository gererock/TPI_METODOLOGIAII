package com.bodypaint.feature.utils;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class ActualizarStock {

    private final IProductoRepository repositoryProducto;

    public void actualizarStock(Map<Long,Integer> map) {
        
        map.forEach((id, cantidad)->{

        Producto producto = repositoryProducto.findById(id)
            .orElseThrow(() -> new NotFoundException("Producto no encontrado"));

        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("El producto no cuenta con stock suficiente");
        }

        Integer nuevoStock = producto.getStock() - cantidad;

        producto.setStock(nuevoStock);
        producto.setSinStock(nuevoStock == 0);

        repositoryProducto.save(producto);
    });
}
}
