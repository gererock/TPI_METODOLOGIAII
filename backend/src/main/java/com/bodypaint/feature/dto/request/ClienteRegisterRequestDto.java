package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record  ClienteRegisterRequestDto(

    @NotNull(message="Debe Ingresar un DNI") 
    Long dni,

    @NotBlank(message="Debe completar el nombre y apellido") 
    String nombre,

    @Email(message="El email no sigue el formato")
    @NotBlank(message="El email debe ser completado") 
    String email,

    @NotBlank(message="Debe completar la contraseña")
    @Size(min= 8, message="La contraseña debe tener un minimo de 8 caracteres") 
    String password,

    @NotBlank(message="Debe ingresar una localidad")
    String localidad,

    @NotBlank(message="Debe ingresar una provincia")
    String provincia,

    @Positive(message="El piso debe ser mayor a 0")
    Integer piso,

    String departamento
) {
    
}
