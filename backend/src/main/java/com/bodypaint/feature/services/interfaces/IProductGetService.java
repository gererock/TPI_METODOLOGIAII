package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.models.Producto;

public interface IProductGetService {
    Producto getProductoById(Long id);
}
