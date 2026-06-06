package com.bodypaint.feature.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.AdminLoginRequestDto;
import com.bodypaint.feature.services.interfaces.IAdminLoginService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AdminController {

    private final IAdminLoginService adminLoginService;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<?>> login(@Valid @RequestBody AdminLoginRequestDto dto) {
        return ResponseEntity.ok(
                BaseResponse.ok(adminLoginService.login(dto), "Inicio de sesión administrador correcto")
        );
    }
}