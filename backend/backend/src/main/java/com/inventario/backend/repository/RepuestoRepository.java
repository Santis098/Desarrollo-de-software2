package com.inventario.backend.repository;

import com.inventario.backend.model.Repuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepuestoRepository extends JpaRepository<Repuesto, String> {
    // Buscar por la clave natural idRepuesto (String)
    Optional<Repuesto> findByIdRepuesto(String idRepuesto);

    // Listar todos por id de referencia (FK)
    List<Repuesto> findByReferenciaIdReferencia(String idReferencia);

    

}





