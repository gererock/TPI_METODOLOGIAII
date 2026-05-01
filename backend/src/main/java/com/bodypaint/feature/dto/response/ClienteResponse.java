package com.bodypaint.feature.dto.response;

public record ClienteResponse(

    Long id,

    Long dni,

    String nombre,

    String email,

    String localidad,

    String provincia,

    Integer piso,

    Integer departamento

) {
    
}
