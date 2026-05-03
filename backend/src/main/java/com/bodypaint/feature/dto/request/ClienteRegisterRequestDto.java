package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record  ClienteRegisterRequestDto(

    @NotNull Long dni,

    @NotBlank String nombre,

    @Email
    @NotBlank String email,

    @NotBlank
    @Size(min= 8) String password,

    @NotBlank String localidad,

    @NotBlank String provincia,

    Integer piso,

    String departamento
) {
    
}
