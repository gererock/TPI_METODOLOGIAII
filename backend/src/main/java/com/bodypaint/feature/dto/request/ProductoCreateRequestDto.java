package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record ProductoCreateRequestDto(

    @NotBlank(message="El nombre es obligatorio ingresarlo.")
    String nombre,

    @NotBlank(message="La marca es obligatoria ingresarla.") 
    String marca,

    @NotNull(message="El precio es obligatorio ingresarlo.")
    @Positive(message="el campo de precio debe ser mayor a 0") 
    Double precio,

    @NotNull(message="Stock es obligatorio ingresarlo.") 
    @Positive(message="el campo de stock debe ser mayor a 0") 
    Integer stock,

    @NotBlank(message="Debe ingresar una url en foto obligatorio.")
    @Pattern(
        regexp = "^(http|https)://.*$",
        message = "La foto debe ser una URL válida"
    )
    String foto,

    String descripcion

) {
}
