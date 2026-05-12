package com.bodypaint.feature.services.interfaces;

import java.util.List;

import com.bodypaint.feature.dto.response.PedidoResponse;

public interface  IPedidoGetService {
    PedidoResponse getById(Long id);
    List<PedidoResponse> getAll();
}
