package com.bodypaint.feature.services.interfaces;

import com.bodypaint.feature.dto.response.ProductoResponseDto;

public interface IProductGetService {
    ProductoResponseDto getProductoById(Long id);
}
