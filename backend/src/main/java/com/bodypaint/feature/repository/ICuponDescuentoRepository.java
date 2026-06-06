package com.bodypaint.feature.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bodypaint.feature.models.CuponDescuento;

@Repository
public interface ICuponDescuentoRepository extends JpaRepository<CuponDescuento, Long> {

    Optional<CuponDescuento> findByCodigo(Long codigo);
}