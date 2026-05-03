package com.bodypaint.feature.services.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.bodypaint.feature.models.Producto;

public interface IProductGetService {
    Page<Producto> obtenerProductos(Pageable pageable);
}
