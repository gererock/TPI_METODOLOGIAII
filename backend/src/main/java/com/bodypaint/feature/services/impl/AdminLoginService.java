package com.bodypaint.feature.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.LoginInvalidoException;
import com.bodypaint.feature.dto.request.AdminLoginRequestDto;
import com.bodypaint.feature.dto.response.AdminLoginResponseDto;
import com.bodypaint.feature.services.interfaces.IAdminLoginService;

@Service
public class AdminLoginService implements IAdminLoginService {

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public AdminLoginResponseDto login(AdminLoginRequestDto dto) {

        boolean emailCorrecto = adminEmail.equals(dto.email());
        boolean passwordCorrecta = adminPassword.equals(dto.password());

        if (!emailCorrecto || !passwordCorrecta) {
            throw new LoginInvalidoException("Administrador no registrado o datos mal ingresados.");
        }

        return new AdminLoginResponseDto(adminEmail, "ADMIN");
    }
}