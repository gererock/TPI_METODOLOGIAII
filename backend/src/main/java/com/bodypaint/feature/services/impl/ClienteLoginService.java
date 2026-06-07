package com.bodypaint.feature.services.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bodypaint.feature.Config.errors.LoginInvalidoException;
import com.bodypaint.feature.dto.request.ClienteLoginRequestDto;
import com.bodypaint.feature.dto.response.ClienteLoginResponseDto;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.services.interfaces.IClienteLoginService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ClienteLoginService implements IClienteLoginService {

    private final IClientreRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ClienteLoginResponseDto login(ClienteLoginRequestDto dto) {

        Cliente cliente = repository.findByEmail(dto.email())
                .orElseThrow(() -> new LoginInvalidoException("Cliente no registrado o datos mal ingresados."));

        if (!passwordEncoder.matches(dto.password(), cliente.getPassword())) {
            throw new LoginInvalidoException("Cliente no registrado o datos mal ingresados.");
        }

        return new ClienteLoginResponseDto(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getEmail()
        );
    }
}