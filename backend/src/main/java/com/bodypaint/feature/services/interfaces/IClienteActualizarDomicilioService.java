package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.ActualizarDomicilioRequestDto;
import com.bodypaint.feature.dto.response.DomicilioResponseDto;

public interface IClienteActualizarDomicilioService {
    DomicilioResponseDto actualizarDomicilio(Long idCliente, ActualizarDomicilioRequestDto dto);
}
