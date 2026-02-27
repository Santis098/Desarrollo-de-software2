package com.inventario.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "repuesto")
public class Repuesto {

    @Id
    @Column(name = "id_repuesto", nullable = false, length = 50)
    private String idRepuesto;  // lo provee el frontend

    @Column(name = "fecha_registro", nullable = false)
    private String fechaRegistro; // formato "yyyy-MM-dd HH:mm"

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private String calidad; // "NUEVO" o "DE_SEGUNDA"

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private String estado; // "EN_BODEGA", "PARA_REPARAR", "EN_REPARACION"

    private String imagen; // dejamos el campo pero NO guardaremos archivos

    // Relación con Referencia (guardamos solo la referencia como entidad)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_referencia", nullable = false)
    @JsonIgnoreProperties({"repuestos", "hibernateLazyInitializer", "handler"})
    private com.inventario.backend.model.Referencia referencia;
}
