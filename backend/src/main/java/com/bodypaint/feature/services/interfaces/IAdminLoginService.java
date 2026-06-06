package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.AdminLoginRequestDto;
import com.bodypaint.feature.dto.response.AdminLoginResponseDto;

public interface IAdminLoginService {

    AdminLoginResponseDto login(AdminLoginRequestDto dto);
}