package com.bodypaint.feature.services.impl;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.response.ProductoStockMinimoReporteDto;
import com.bodypaint.feature.models.Producto;
import com.bodypaint.feature.repository.IProductoRepository;
import com.bodypaint.feature.services.interfaces.IProductGetService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProductGetService implements IProductGetService {

    private static final double PORCENTAJE_CERCANIA = 20.0;

    private final IProductoRepository productoRepository;

    @Override
    public Page<Producto> obtenerProductos(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }

    @Override
    public List<ProductoStockMinimoReporteDto> obtenerReporteStockMinimo() {
        return productoRepository.findAll()
                .stream()
                .filter(this::estaCercaDelStockMinimo)
                .map(this::mapearReporteStockMinimo)
                .toList();
    }

    private boolean estaCercaDelStockMinimo(Producto producto) {
        if (producto.getStock() == null || producto.getStockMinimo() == null) {
            return false;
        }

        double cota = producto.getStockMinimo() + (producto.getStockMinimo() * PORCENTAJE_CERCANIA / 100);

        return producto.getStock() <= cota;
    }

    private ProductoStockMinimoReporteDto mapearReporteStockMinimo(Producto producto) {
        return new ProductoStockMinimoReporteDto(
                producto.getId(),
                producto.getNombre(),
                producto.getStock(),
                producto.getStockMinimo(),
                obtenerEstadoStock(producto)
        );
    }

    private String obtenerEstadoStock(Producto producto) {
        if (producto.getStock() == 0) {
            return "Sin stock";
        }

        if (producto.getStock() < producto.getStockMinimo()) {
            return "Por debajo del mínimo";
        }

        if (producto.getStock().equals(producto.getStockMinimo())) {    
            return "Stock mínimo alcanzado";
        }

        return "Cerca del mínimo";
    }
}