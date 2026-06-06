package com.bodypaint.feature.services.interfaces;

import java.util.List;

import com.bodypaint.feature.dto.response.ClienteListadoResponseDto;

public interface IClienteGetService {

    List<ClienteListadoResponseDto> obtenerClientes();
}