package com.bodypaint.feature.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.bodypaint.feature.models.Producto;


public interface IProductoRepository extends CrudRepository<Producto, Long>{
    Optional<Producto> findByNombre(String nombre);
}
