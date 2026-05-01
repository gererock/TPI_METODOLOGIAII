package com.bodypaint.feature.mapper;

import com.bodypaint.feature.dto.request.ProductoCreateRequestDto;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.models.Producto;

public class ProductMapper {
    

    public static Producto toEntity(ProductoCreateRequestDto dto){
        Producto producto = Producto.builder()
                        .nombre(dto.nombre())
                        .marca(dto.marca())
                        .precio(dto.precio())
                        .stock(dto.stock())
                        .foto(dto.foto())
                        .descripcion(dto.descripcion())
                        .build();
        return producto;
    }


    public static ProductoResponseDto toResponse(Producto p){

        return new ProductoResponseDto(p.getNombre(), 
                                        p.getMarca(), 
                                        p.getPrecio(), 
                                        p.getStock(), 
                                        p.getFoto(), 
                                        p.getDescripcion());

    }



}
