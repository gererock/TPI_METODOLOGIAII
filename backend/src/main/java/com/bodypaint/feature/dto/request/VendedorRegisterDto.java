package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record VendedorRegisterDto(

    @NotNull(message="El dni es un elemento obligatorio")
    @Positive(message="El dni debe ser un numero positivo")
    Integer dni,

    @NotBlank(message="El nombre no puede estar en blanco")
    String nombre,

    @NotBlank(message="El email no puede estar en blanco")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+\\-]+@(gmail\\.com|hotmail\\.com|outlook\\.com|yahoo\\.com)$",
        message = "El email debe ser de Gmail, Hotmail, Outlook o Yahoo"
    )
    String email,

    @NotBlank(message="La contraseña no puede quedar en blanco")
    @Size(min=8, message="El tamaño minimo de las contraseña es de 8 caracteres")
    String password


) {
    
}
