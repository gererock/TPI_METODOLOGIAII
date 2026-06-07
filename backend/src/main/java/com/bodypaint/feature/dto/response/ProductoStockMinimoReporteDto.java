package com.bodypaint.feature.dto.response;

public record ProductoStockMinimoReporteDto(
        Long codigo,
        String nombre,
        Integer stockActual,
        Integer stockMinimo,
        String estado
) {
}