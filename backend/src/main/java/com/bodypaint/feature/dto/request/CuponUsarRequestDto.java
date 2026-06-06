package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotNull;

public record CuponUsarRequestDto(

        @NotNull(message = "Debe ingresar el id del cliente.")
        Long idCliente,

        @NotNull(message = "Debe ingresar el código del cupón.")
        Long codigoCupon

) {
}