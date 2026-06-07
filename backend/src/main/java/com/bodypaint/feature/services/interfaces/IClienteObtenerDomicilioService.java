package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.response.DomicilioResponseDto;

public interface IClienteObtenerDomicilioService {
    DomicilioResponseDto obtenerDomicilio(Long idCliente);
}
