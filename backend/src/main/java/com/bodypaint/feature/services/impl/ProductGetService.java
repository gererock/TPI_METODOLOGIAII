package com.bodypaint.feature.services.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;
import com.bodypaint.feature.services.interfaces.IProductGetService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProductGetService implements IProductGetService {


    private final IProductoRepository productoRepository;


    @Override
    public Page<Producto> obtenerProductos(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }

    
    
}
