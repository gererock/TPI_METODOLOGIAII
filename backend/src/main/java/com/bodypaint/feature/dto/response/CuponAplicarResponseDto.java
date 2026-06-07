package com.bodypaint.feature.dto.response;

import java.math.BigDecimal;

public record CuponAplicarResponseDto(

        Long codigoCupon,
        BigDecimal totalOriginal,
        BigDecimal descuentoAplicado,
        BigDecimal totalFinal

) {
}