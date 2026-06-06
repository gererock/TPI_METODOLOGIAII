package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.CuponAplicarRequestDto;
import com.bodypaint.feature.dto.request.CuponDescuentoRequestDto;
import com.bodypaint.feature.dto.request.CuponUsarRequestDto;
import com.bodypaint.feature.dto.response.CuponAplicarResponseDto;
import com.bodypaint.feature.dto.response.CuponDescuentoResponseDto;

public interface ICuponDescuentoService {

    CuponDescuentoResponseDto generarCupon(CuponDescuentoRequestDto dto);

    CuponAplicarResponseDto aplicarCupon(CuponAplicarRequestDto dto);

    CuponDescuentoResponseDto marcarCuponComoUsado(CuponUsarRequestDto dto);
}