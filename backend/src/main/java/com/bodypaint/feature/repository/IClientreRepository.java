package com.bodypaint.feature.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bodypaint.feature.models.Cliente;


public interface IClientreRepository extends JpaRepository<Cliente, Long>{
    
    Optional<Cliente> findByDni(Long dni);

    Optional<Cliente> findByEmail(String email);

}
