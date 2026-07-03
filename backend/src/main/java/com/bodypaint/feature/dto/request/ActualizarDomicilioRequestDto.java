package com.bodypaint.feature.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ActualizarDomicilioRequestDto(

    @NotBlank(message = "La calle es obligatoria")
    String calle,

    @NotNull(message = "La altura es obligatoria")
    @Positive(message = "La altura debe ser mayor a 0")
    Integer altura,

    @NotBlank(message = "La localidad es obligatoria")
    String localidad,

    @NotBlank(message = "La provincia es obligatoria")
    String provincia,

    @NotNull(message = "El código postal es obligatorio")
    @Positive(message = "El código postal debe ser mayor a 0")
    Integer codigoPostal,

    Integer piso,

    String departamento

) {}
