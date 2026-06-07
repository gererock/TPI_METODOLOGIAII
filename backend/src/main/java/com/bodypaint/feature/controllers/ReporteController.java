package com.bodypaint.feature.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.dto.response.ProductoMasVendidoResponseDto;
import com.bodypaint.feature.services.interfaces.IReporteProductosMasVendidosService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteController {

    private final IReporteProductosMasVendidosService reporteProductosMasVendidosService;

    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<ProductoMasVendidoResponseDto>> generarReporteProductosMasVendidos(
            @RequestParam Integer mes,
            @RequestParam Integer anio,
            @RequestParam(required = false) Integer dia
    ) {
        List<ProductoMasVendidoResponseDto> reporte = reporteProductosMasVendidosService.generarReporte(
                mes,
                anio,
                dia
        );

        return ResponseEntity.ok(reporte);
    }

}