package com.bodypaint.feature.dto.request;
import java.math.BigDecimal;

import com.bodypaint.feature.models.TipoDescuento;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CuponDescuentoRequestDto(

        @NotNull(message = "Debe ingresar el id del cliente.")
        Long idCliente,

        @NotBlank(message = "Debe ingresar la fecha desde.")
        String fechaDesde,

        @NotBlank(message = "Debe ingresar la fecha hasta.")
        String fechaHasta,

        @NotNull(message = "Debe seleccionar el tipo de descuento.")
        TipoDescuento tipoDescuento,

        @NotNull(message = "Debe ingresar el valor del descuento.")
        @DecimalMin(value = "0.01", message = "El valor del descuento debe ser mayor a 0.")
        @Digits(integer = 10, fraction = 2, message = "El valor del descuento debe tener hasta dos decimales.")
        BigDecimal valorDescuento

) {
}