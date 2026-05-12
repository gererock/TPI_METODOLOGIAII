package com.bodypaint.feature.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bodypaint.feature.models.Pedido;

public interface IPedidoRepository  extends JpaRepository<Pedido, Long>{
    
}
