package com.bodypaint.feature.services.impl;

import org.springframework.stereotype.Service;

import com.bodypaint.feature.dto.request.ClienteRegisterRequestDto;
import com.bodypaint.feature.dto.response.ClienteResponse;
import com.bodypaint.feature.mapper.ClienteMapper;
import com.bodypaint.feature.models.Cliente;
import com.bodypaint.feature.repository.IClientreRepository;
import com.bodypaint.feature.services.interfaces.IClienteRegisterService;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AllArgsConstructor;


@Service
@AllArgsConstructor
public class ClienteRegisterService implements IClienteRegisterService{

    private final IClientreRepository repository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public ClienteResponse registrar(ClienteRegisterRequestDto dto) {

        if(repository.findByDni(dto.dni()).isPresent() || repository.findByEmail(dto.email()).isPresent()){
            throw new RuntimeException("Cliente ya registrado.");
        }

        Cliente cliente = ClienteMapper.toEntity(dto);

        String passwordHasheada = passwordEncoder.encode(dto.password());
        cliente.setPassword(passwordHasheada);


        repository.save(cliente);

        return ClienteMapper.toResponse(cliente);
    }
    
}
