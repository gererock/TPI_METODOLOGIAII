package com.bodypaint.feature.services.interfaces;

import java.util.List;

import com.bodypaint.feature.dto.response.ProductoMasVendidoResponseDto;

public interface IReporteProductosMasVendidosService {

    List<ProductoMasVendidoResponseDto> generarReporte(Integer mes, Integer anio, Integer dia);

}