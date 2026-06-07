package com.bodypaint.feature.mapper;

import com.bodypaint.feature.dto.request.ProductoCreateRequestDto;
import com.bodypaint.feature.dto.response.ProductoResponseDto;
import com.bodypaint.feature.models.Producto;

public class ProductMapper {


    public static Producto toEntity(ProductoCreateRequestDto dto){
<<<<<<< Updated upstream
        return Producto.builder()
                    .nombre(dto.nombre())
                    .marca(dto.marca())
                    .precio(dto.precio())
                    .stock(dto.stock())
                    .stockMinimo(dto.stockMinimo())
                    .foto(dto.foto())
                    .descripcion(dto.descripcion())
                    .sinStock(false)
                    .build();
=======
        Producto producto = Producto.builder()
                        .nombre(dto.nombre())
                        .marca(dto.marca())
                        .precio(dto.precio())
                        .stock(dto.stock())
                        .stockMinimo(dto.stockMinimo())
                        .foto(dto.foto())
                        .descripcion(dto.descripcion())
                        .sinStock(false)
                        .build();
        return producto;
>>>>>>> Stashed changes
    }


    public static ProductoResponseDto toResponse(Producto p){

        return new ProductoResponseDto(p.getId(), 
                                        p.getNombre(), 
                                        p.getMarca(), 
                                        p.getPrecio(), 
                                        p.getStock(),
                                        p.getStockMinimo(),
                                        p.getFoto(), 
                                        p.getDescripcion(),
                                        p.getSinStock());

    }

}
