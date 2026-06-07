package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.ClienteLoginRequestDto;
import com.bodypaint.feature.dto.response.ClienteLoginResponseDto;

public interface IClienteLoginService {

    ClienteLoginResponseDto login(ClienteLoginRequestDto dto);
}