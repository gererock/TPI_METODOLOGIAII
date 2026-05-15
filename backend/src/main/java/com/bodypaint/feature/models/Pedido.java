package com.bodypaint.feature.models;

import java.time.LocalDate;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name="pedidos")
@Builder
public class Pedido {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(
        name = "pedido_productos",
        joinColumns = @JoinColumn(name = "pedido_id")
    )
    @MapKeyColumn(name = "producto_id")
    @Column(name = "cantidad")
    private Map<Long, Integer> productos;

    private LocalDate fechaDePedido;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    private Double total;

    private Long id_cliente;
}
