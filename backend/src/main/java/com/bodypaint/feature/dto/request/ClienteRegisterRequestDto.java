package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record  ClienteRegisterRequestDto(

    @NotNull Long dni,

    @NotBlank String nombre,

    @Email
    @NotBlank String email,

    @NotBlank
    @Min(8) String password,

    @NotBlank String localidad,

    @NotBlank String provincia,

    Integer piso,

    Integer departamento
) {
    
}
