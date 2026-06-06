package com.bodypaint.feature.dto.response;

public record ClienteListadoResponseDto(
        Long id,
        String nombre,
        String email
) {
}