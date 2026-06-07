package com.bodypaint.feature.dto.response;

public record ProductoMasVendidoResponseDto(

        Long idProducto,

        String nombre,

        String marca,

        Integer cantidadVendida,

        Double precioUnitario,

        Integer stockActual

) {
}