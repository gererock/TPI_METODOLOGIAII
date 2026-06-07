package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequestDto(

    @NotBlank(message = "El email es obligatorio")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    String password

) {
}