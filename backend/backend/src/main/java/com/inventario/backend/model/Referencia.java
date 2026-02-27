package com.inventario.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "referencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Referencia {

    @Id
    @Column(name = "id_referencia", nullable = false, length = 50)
    private String idReferencia;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private boolean activo = true;
}

