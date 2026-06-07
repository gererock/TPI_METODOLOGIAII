package com.bodypaint.feature.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CuponAplicarRequestDto(

        @NotNull(message = "Debe ingresar el id del cliente.")
        Long idCliente,

        @NotNull(message = "Debe ingresar el código del cupón.")
        Long codigoCupon,

        @NotNull(message = "Debe ingresar el total del pedido.")
        @DecimalMin(value = "0.01", message = "El total del pedido debe ser mayor a 0.")
        BigDecimal totalPedido

) {
}