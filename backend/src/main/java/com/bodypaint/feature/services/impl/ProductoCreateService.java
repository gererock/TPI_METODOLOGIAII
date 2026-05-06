package com.bodypaint.feature.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.ProductoYaExisteException;
import com.bodypaint.feature.dto.request.ProductoCreateRequestDto;
import com.bodypaint.feature.mapper.ProductMapper;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;
import com.bodypaint.feature.services.interfaces.IProductCreateService;

import lombok.AllArgsConstructor;


@Service
@AllArgsConstructor
public class ProductoCreateService implements IProductCreateService{

    private final IProductoRepository productoRepository;

    @Override
    public void cerate(ProductoCreateRequestDto dto) {
        
        Producto producto = ProductMapper.toEntity(dto);

        Optional<Producto> productoEncontrado = productoRepository.findByNombre(producto.getNombre());

        if (productoEncontrado.isPresent() && productoEncontrado.get().getMarca().equals(producto.getMarca())) {
        
            throw new ProductoYaExisteException("Ya existe un producto con esas características");
    }

        productoRepository.save(producto);
    }
}
