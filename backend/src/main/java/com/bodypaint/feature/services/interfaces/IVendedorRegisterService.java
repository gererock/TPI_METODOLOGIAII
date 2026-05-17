package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.VendedorRegisterDto;
import com.bodypaint.feature.dto.response.VendedorRespose;

public interface IVendedorRegisterService {
    VendedorRespose registrar(VendedorRegisterDto dto);
}
