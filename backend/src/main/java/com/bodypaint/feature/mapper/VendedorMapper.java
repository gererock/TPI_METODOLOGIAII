package com.bodypaint.feature.mapper;

import com.bodypaint.feature.dto.request.VendedorRegisterDto;
import com.bodypaint.feature.dto.response.VendedorRespose;
import com.bodypaint.feature.models.Vendedor;

public class VendedorMapper {
    

    public static Vendedor toEntity(VendedorRegisterDto dto){
        return Vendedor.builder()
                        .dni(dto.dni())
                        .nombre(dto.nombre())
                        .email(dto.email())
                        .build();
    }

    public static VendedorRespose tRespose(Vendedor v){
        return new VendedorRespose(v.getId(),v.getDni(),v.getNombre(),v.getEmail());
    }
}
