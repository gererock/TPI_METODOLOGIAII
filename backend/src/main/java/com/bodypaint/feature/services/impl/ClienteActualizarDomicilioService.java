package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bodypaint.feature.Config.errors.NotFoundException;
import com.bodypaint.feature.dto.request.ActualizarDomicilioRequestDto;
import com.bodypaint.feature.dto.response.DomicilioResponseDto;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.services.interfaces.IClienteActualizarDomicilioService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClienteActualizarDomicilioService implements IClienteActualizarDomicilioService {

    private final IClientreRepository clienteRepository;

    @Override
    @Transactional
    public DomicilioResponseDto actualizarDomicilio(Long idCliente, ActualizarDomicilioRequestDto dto) {

        Cliente cliente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new NotFoundException("Cliente no encontrado con id: " + idCliente));

        cliente.setCalle(dto.calle());
        cliente.setAltura(dto.altura());
        cliente.setLocalidad(dto.localidad());
        cliente.setProvincia(dto.provincia());
        cliente.setCodigoPostal(dto.codigoPostal());
        cliente.setPiso(dto.piso());
        cliente.setDepartamento(dto.departamento());

        clienteRepository.save(cliente);

        return toDomicilioResponse(cliente);
    }

    private DomicilioResponseDto toDomicilioResponse(Cliente c) {
        return new DomicilioResponseDto(
            c.getId(),
            c.getNombre(),
            c.getCalle(),
            c.getAltura(),
            c.getLocalidad(),
            c.getProvincia(),
            c.getCodigoPostal(),
            c.getPiso(),
            c.getDepartamento()
        );
    }
}
