package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.mapper.ProductMapper;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;
import com.bodypaint.feature.services.interfaces.IProductGetService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProductGetService implements IProductGetService {


    private final IProductoRepository productoRepository;


    @Override
    public ProductoResponseDto getProductoById(Long id) {
        
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return ProductMapper.toResponse(producto);

    }

    
    
}
