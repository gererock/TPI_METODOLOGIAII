package com.bodypaint.feature.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="clientes")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    private Long dni;
    
    private String nombre;

    private String email;

    private String password;

    private String localidad;

    private String provincia;

    private Integer piso;

    private Integer departamento;


}
