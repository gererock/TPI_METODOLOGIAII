package com.bodypaint.feature.dto.response;

public record ProductoResponseDto(

    Long id,
    String nombre,
    String marca,
    Double precio,
    Integer stock,
    Integer stockMinimo,
    String foto,
    String descripcion,
    Boolean sinStock
    
) {
}
    