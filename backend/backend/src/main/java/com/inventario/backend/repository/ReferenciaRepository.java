package com.inventario.backend.repository;

import com.inventario.backend.model.Referencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ReferenciaRepository extends JpaRepository<Referencia, String> {

    // Buscar por nombre (único)
    Optional<Referencia> findByNombre(String nombre);

    // Referencias activas
    List<Referencia> findByActivoTrue();

    // Referencias inactivas
    List<Referencia> findByActivoFalse();

    // Buscar por estado (true = activas, false = inactivas)
    List<Referencia> findByActivo(boolean activo);
}

