package com.bodypaint.feature.dto.response;

public record DomicilioResponseDto(
    Long idCliente,
    String nombre,
    String calle,
    Integer altura,
    String localidad,
    String provincia,
    Integer codigoPostal,
    Integer piso,
    String departamento
) {}
