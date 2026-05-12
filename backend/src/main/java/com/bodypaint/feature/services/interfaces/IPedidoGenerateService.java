package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.request.PedidoRequestDto;
import com.bodypaint.feature.dto.response.PedidoResponse;

public interface IPedidoGenerateService {
    PedidoResponse generar(PedidoRequestDto pd);
}
