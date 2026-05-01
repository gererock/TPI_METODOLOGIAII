package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.ClienteRegisterRequestDto;
import com.bodypaint.feature.dto.response.ClienteResponse;

public interface IClienteRegisterService {
    ClienteResponse registrar(ClienteRegisterRequestDto dto);
}
