package com.bodypaint.feature.dto.response;

public record ProductoResponseDto(

    String nombre,
    String marca,
    Double precio,
    Integer stock,
    String foto,
    String descripcion,
    String catalogo
    
) {
}
