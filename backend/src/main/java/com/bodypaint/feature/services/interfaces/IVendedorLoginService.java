package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.VendedorLoginRequestDto;
import com.bodypaint.feature.dto.response.VendedorLoginResponseDto;

public interface IVendedorLoginService {

    VendedorLoginResponseDto login(VendedorLoginRequestDto dto);
}