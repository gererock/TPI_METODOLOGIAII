package com.bodypaint.feature.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.VendedorLoginRequestDto;
import com.bodypaint.feature.services.interfaces.IVendedorLoginService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/vendedor")
@AllArgsConstructor
public class VendedorLoginController {

    private final IVendedorLoginService vendedorLoginService;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<?>> login(@Valid @RequestBody VendedorLoginRequestDto dto) {
        return ResponseEntity.ok(
                BaseResponse.ok(vendedorLoginService.login(dto), "Inicio de sesión vendedor correcto")
        );
    }
}