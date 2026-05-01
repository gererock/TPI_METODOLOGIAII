package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductoCreateRequestDto(

    @NotBlank(message="uno de los campos obligatorios esta incompleto.") String nombre,
    @NotBlank(message="uno de los campos obligatorios esta incompleto.") String marca,
    @NotNull(message="uno de los campos obligatorios esta incompleto.") @Positive(message="el campo de precio debe ser mayor a 0") Double precio,
    @NotNull(message="uno de los campos obligatorios esta incompleto.") @Positive(message="el campo de stock debe ser mayor a 0") Integer stock,
    @NotBlank(message="uno de los campos obligatorios esta incompleto.") String foto,
    String descripcion

) {
}
