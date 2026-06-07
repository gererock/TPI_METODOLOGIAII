package com.bodypaint.feature.dto.response;

public record ClienteLoginResponseDto(
    Long id,
    String nombre,
    String email
) {
}