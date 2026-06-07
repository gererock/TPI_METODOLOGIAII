package com.bodypaint.feature.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bodypaint.feature.Config.BaseResponse;
import com.bodypaint.feature.dto.request.ActualizarDomicilioRequestDto;
import com.bodypaint.feature.dto.request.ClienteLoginRequestDto;
import com.bodypaint.feature.dto.request.ClienteRegisterRequestDto;
import com.bodypaint.feature.services.interfaces.IClienteActualizarDomicilioService;
import com.bodypaint.feature.services.interfaces.IClienteGetService;
import com.bodypaint.feature.services.interfaces.IClienteLoginService;
import com.bodypaint.feature.services.interfaces.IClienteObtenerDomicilioService;
import com.bodypaint.feature.services.interfaces.IClienteRegisterService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clientes")
@AllArgsConstructor
public class ClienteController {

    private final IClienteRegisterService clienteRegisterService;
    private final IClienteLoginService clienteLoginService;
    private final IClienteGetService clienteGetService;
    private final IClienteObtenerDomicilioService clienteObtenerDomicilioService;
    private final IClienteActualizarDomicilioService clienteActualizarDomicilioService;

    @PostMapping("/register")
    public ResponseEntity<BaseResponse<?>> registrar(@Valid @RequestBody ClienteRegisterRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.ok(clienteRegisterService.registrar(dto), "Cliente registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<?>> login(@Valid @RequestBody ClienteLoginRequestDto dto) {
        return ResponseEntity.ok(
                BaseResponse.ok(clienteLoginService.login(dto), "Inicio de sesión correcto")
        );
    }

    @GetMapping
    public ResponseEntity<BaseResponse<?>> listarClientes() {
        return ResponseEntity.ok(
                BaseResponse.ok(clienteGetService.obtenerClientes(), "Clientes encontrados correctamente")
        );
    }

    /**
     * GET /api/clientes/{id}/domicilio
     * Devuelve el domicilio actual del cliente.
     */
    @GetMapping("/{id}/domicilio")
    public ResponseEntity<BaseResponse<?>> obtenerDomicilio(@PathVariable Long id) {
        return ResponseEntity.ok(
                BaseResponse.ok(
                        clienteObtenerDomicilioService.obtenerDomicilio(id),
                        "Domicilio obtenido correctamente"
                )
        );
    }

    /**
     * PUT /api/clientes/{id}/domicilio
     * Actualiza el domicilio del cliente y persiste en base de datos.
     */
    @PutMapping("/{id}/domicilio")
    public ResponseEntity<BaseResponse<?>> actualizarDomicilio(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarDomicilioRequestDto dto) {
        return ResponseEntity.ok(
                BaseResponse.ok(
                        clienteActualizarDomicilioService.actualizarDomicilio(id, dto),
                        "Domicilio actualizado correctamente"
                )
        );
    }
}
