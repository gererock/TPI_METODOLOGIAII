package com.bodypaint.feature.dto.response;

import java.math.BigDecimal;

import com.bodypaint.feature.models.TipoDescuento;

public record CuponDescuentoResponseDto(

        Long codigo,
        Long idCliente,
        String nombreCliente,
        String emailCliente,
        String fechaDesde,
        String fechaHasta,
        TipoDescuento tipoDescuento,
        BigDecimal valorDescuento,
        Boolean usado,
        String mensajeEnvioMail

) {
}