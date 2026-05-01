package com.bodypaint.feature.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bodypaint.feature.models.Producto;


public interface IProductoRepository extends JpaRepository<Producto, Long>{
    Optional<Producto> findByNombre(String nombre);
}
