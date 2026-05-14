package com.bodypaint.feature.utils;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.mapper.ProductMapper;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class BuscarProductoPorPedido {


    private final IProductoRepository productoRepository;
    
    public Map<ProductoResponseDto, Integer> buscarMap(Map<Long,Integer> map ){

        Map<ProductoResponseDto, Integer> productosResponse = new HashMap<>();

        map.forEach((pid, cantidad)->{

            Producto productoEncontrado = productoRepository.findById(pid).orElseThrow(() -> new NotFoundException("Producto "+ pid + " no encontrado"));

            productosResponse.put(ProductMapper.toResponse(productoEncontrado), cantidad);

        });

        return productosResponse;
    }
}
