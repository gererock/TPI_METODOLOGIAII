package com.bodypaint.feature.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bodypaint.feature.models.Vendedor;

public interface IVendedorRepository extends JpaRepository<Vendedor, Long>{
    
}
