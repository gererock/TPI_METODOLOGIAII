package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.response.PedidoResponse;

public interface IPedidoEstadoService {
    PedidoResponse cambiarEstado(Long id, String nuevoEstado);
}
