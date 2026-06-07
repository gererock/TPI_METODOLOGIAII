package com.bodypaint.feature.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.CuponAplicarRequestDto;
import com.bodypaint.feature.dto.request.CuponDescuentoRequestDto;
import com.bodypaint.feature.services.interfaces.ICuponDescuentoService;

import org.springframework.web.bind.annotation.PatchMapping;
import com.bodypaint.feature.dto.request.CuponUsarRequestDto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/cupones")
@AllArgsConstructor
public class CuponDescuentoController {

    private final ICuponDescuentoService cuponDescuentoService;

    @PostMapping
    public ResponseEntity<BaseResponse<?>> generarCupon(
            @Valid @RequestBody CuponDescuentoRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.ok(
                        cuponDescuentoService.generarCupon(dto),
                        "Cupón generado correctamente"
                ));
    }

    @PostMapping("/aplicar")
    public ResponseEntity<BaseResponse<?>> aplicarCupon(
            @Valid @RequestBody CuponAplicarRequestDto dto
    ) {
        return ResponseEntity.ok(
                BaseResponse.ok(
                        cuponDescuentoService.aplicarCupon(dto),
                        "Cupón aplicado correctamente"
                )
        );
    }


    @PatchMapping("/usar")
        public ResponseEntity<BaseResponse<?>> marcarCuponComoUsado(
                @Valid @RequestBody CuponUsarRequestDto dto
        ) {
                return ResponseEntity.ok(
                        BaseResponse.ok(
                                cuponDescuentoService.marcarCuponComoUsado(dto),
                                "Cupón marcado como usado correctamente"
                        )
                );
        }
}