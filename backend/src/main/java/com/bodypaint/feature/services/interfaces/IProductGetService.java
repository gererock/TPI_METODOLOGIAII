package com.bodypaint.feature.services.interfaces;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.bodypaint.feature.dto.response.ProductoStockMinimoReporteDto;
import com.bodypaint.feature.models.Producto;

public interface IProductGetService {

    Page<Producto> obtenerProductos(Pageable pageable);

    List<ProductoStockMinimoReporteDto> obtenerReporteStockMinimo();
}