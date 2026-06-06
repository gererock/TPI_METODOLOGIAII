package com.bodypaint.feature.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.response.ClienteListadoResponseDto;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.services.interfaces.IClienteGetService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClienteGetService implements IClienteGetService {

    private final IClientreRepository clienteRepository;

    @Override
    public List<ClienteListadoResponseDto> obtenerClientes() {
        return clienteRepository.findAll()
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    private ClienteListadoResponseDto convertirAResponse(Cliente cliente) {
        return new ClienteListadoResponseDto(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getEmail()
        );
    }
}