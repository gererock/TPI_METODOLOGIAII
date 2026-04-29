package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductoCreateRequestDto(

    @NotBlank String nombre,
    @NotBlank String marca,
    @NotNull @Positive Double precio,
    @NotNull @Positive Integer stock,
    String descripcion

) {
}
