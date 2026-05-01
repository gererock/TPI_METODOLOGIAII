package com.bodypaint.feature.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.dto.request.ClienteRegisterRequestDto;
import com.bodypaint.feature.services.interfaces.IClienteRegisterService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clientes")
@AllArgsConstructor
public class ClienteController {

    private final IClienteRegisterService clienteRegisterService;

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@Valid @RequestBody ClienteRegisterRequestDto dto){
        try {
            return ResponseEntity.ok().body(
                clienteRegisterService.registrar(dto)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
