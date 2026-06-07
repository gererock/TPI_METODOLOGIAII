package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record  ClienteRegisterRequestDto(

    @NotNull(message="Debe Ingresar un DNI")
    @Positive(message = "El DNI debe ser un número válido") 
    Long dni,

    @NotBlank(message="Debe completar el nombre y apellido") 
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+\\s[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$", message = "El nombre debe contener solo letras y un espacio entre el nombre y apellido")
    String nombre,

    @Pattern(
        regexp = "^[a-zA-Z0-9._%+\\-]+@(gmail\\.com|hotmail\\.com|outlook\\.com|yahoo\\.com)$",
        message = "El email debe ser de Gmail, Hotmail, Outlook o Yahoo"
    )
    @NotBlank(message="El email debe ser completado") 
    String email,

    @NotBlank(message="Debe completar la contraseña")
    @Size(min= 8, message="La contraseña debe tener un minimo de 8 caracteres") 
    String password,

    @NotBlank(message="Debe ingresar una localidad")
    String localidad,

    @NotBlank(message="Debe ingresar una provincia")
    String provincia,

    @NotBlank(message="La calle es un campo obligatorio")
    String calle,

    @Positive(message="La altura debe ser mayor a 0")
    @NotNull(message="La altura es un parametro obligatorio")
    Integer altura,


    @Positive(message="El piso debe ser mayor a 0")
    Integer piso,

    String departamento,

    @Positive(message="El codigo postal debe ser un numero mayor a 0")
    @NotNull(message="El codigo postal es un parametro obligatorio")
    Integer codigoPostal

) {
    
}
