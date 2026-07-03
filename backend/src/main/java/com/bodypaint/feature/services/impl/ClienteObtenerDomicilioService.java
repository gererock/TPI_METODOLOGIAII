package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.response.DomicilioResponseDto;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.services.interfaces.IClienteObtenerDomicilioService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClienteObtenerDomicilioService implements IClienteObtenerDomicilioService {

    private final IClientreRepository clienteRepository;

    @Override
    public DomicilioResponseDto obtenerDomicilio(Long idCliente) {
        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con id: " + idCliente));

        return new DomicilioResponseDto(
            cliente.getId(),
            cliente.getNombre(),
            cliente.getCalle(),
            cliente.getAltura(),
            cliente.getLocalidad(),
            cliente.getProvincia(),
            cliente.getCodigoPostal(),
            cliente.getPiso(),
            cliente.getDepartamento()
        );
    }
}
