package com.bodypaint.feature.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.LoginInvalidoException;
import com.bodypaint.feature.dto.request.VendedorLoginRequestDto;
import com.bodypaint.feature.dto.response.VendedorLoginResponseDto;
import com.bodypaint.feature.services.interfaces.IVendedorLoginService;

@Service
public class VendedorLoginService implements IVendedorLoginService {

    @Value("${vendedor.email}")
    private String vendedorEmail;

    @Value("${vendedor.password}")
    private String vendedorPassword;

    @Override
    public VendedorLoginResponseDto login(VendedorLoginRequestDto dto) {

        boolean emailCorrecto = vendedorEmail.equals(dto.email());
        boolean passwordCorrecta = vendedorPassword.equals(dto.password());

        if (!emailCorrecto || !passwordCorrecta) {
            throw new LoginInvalidoException("Vendedor no registrado o datos mal ingresados.");
        }

        return new VendedorLoginResponseDto(vendedorEmail, "VENDEDOR");
    }
}