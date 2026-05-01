package com.bodypaint.feature.mapper;

import com.bodypaint.feature.dto.request.ClienteRegisterRequestDto;
import com.bodypaint.feature.dto.response.ClienteResponse;
import com.bodypaint.feature.models.Cliente;

public class ClienteMapper {
    
    public static Cliente toEntity(ClienteRegisterRequestDto dto){
        return Cliente.builder()
                        .dni(dto.dni())
                        .nombre(dto.nombre())
                        .email(dto.email())
                        .password(dto.password())
                        .localidad(dto.localidad())
                        .provincia(dto.provincia())
                        .piso(dto.piso())
                        .departamento(dto.departamento())
                        .build();
    }


    public static ClienteResponse toResponse(Cliente cl){

        return new ClienteResponse(cl.getId(),
                                    cl.getDni(), 
                                    cl.getNombre(), 
                                    cl.getEmail(), 
                                    cl.getLocalidad(), 
                                    cl.getProvincia(), 
                                    cl.getPiso(), 
                                    cl.getDepartamento());

    }

}
