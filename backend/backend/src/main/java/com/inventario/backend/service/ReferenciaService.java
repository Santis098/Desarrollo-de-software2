package com.inventario.backend.service;

import com.inventario.backend.model.Referencia;
import com.inventario.backend.repository.ReferenciaRepository;
import com.inventario.backend.utils.ValidadorDatos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.inventario.backend.utils.ValidadorDatos;

import java.util.List;

@Service
public class ReferenciaService {

    @Autowired
    private ReferenciaRepository referenciaRepository;

    // ----------------------------------------------------
    // REGISTRAR REFERENCIA
    // ----------------------------------------------------
    public Referencia registrar(Referencia referencia) {

        referencia.setIdReferencia(referencia.getIdReferencia().trim().toUpperCase());
        referencia.setNombre(referencia.getNombre().trim());

        ValidadorDatos.validarReferencia(referencia);

        if (referenciaRepository.findById(referencia.getIdReferencia()).isPresent()) {
            throw new IllegalArgumentException("El ID ya está registrado.");
        }

        if (referenciaRepository.findByNombre(referencia.getNombre()).isPresent()) {
            throw new IllegalArgumentException("El nombre ya está registrado.");
        }

        return referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // OBTENER SOLO ACTIVAS
    // ----------------------------------------------------
    public List<Referencia> obtenerActivas() {
        return referenciaRepository.findByActivoTrue();
    }

    // ----------------------------------------------------
    // OBTENER SOLO INACTIVAS
    // ----------------------------------------------------
    public List<Referencia> obtenerInactivas() {
        return referenciaRepository.findByActivoFalse();
    }

    // ----------------------------------------------------
    // OBTENER TODAS
    // ----------------------------------------------------
    public List<Referencia> obtenerTodas() {
        return referenciaRepository.findAll();
    }

    // ----------------------------------------------------
    // OBTENER POR ID (String)
    // ----------------------------------------------------
    public Referencia obtenerPorId(String id) {
        return referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referencia no encontrada."));
    }

    // ----------------------------------------------------
    // ACTUALIZAR REFERENCIA
    // ----------------------------------------------------
    public Referencia actualizar(String id, Referencia nuevosDatos) {

        Referencia referencia = referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referencia no encontrada."));

        nuevosDatos.setIdReferencia(nuevosDatos.getIdReferencia().trim().toUpperCase());
        nuevosDatos.setNombre(nuevosDatos.getNombre().trim());

        ValidadorDatos.validarReferencia(nuevosDatos);

        referenciaRepository.findById(nuevosDatos.getIdReferencia())
                .ifPresent(r -> {
                    if (!r.getIdReferencia().equals(id)) {
                        throw new IllegalArgumentException("El ID ya existe en otra referencia.");
                    }
                });

        referenciaRepository.findByNombre(nuevosDatos.getNombre())
                .ifPresent(r -> {
                    if (!r.getIdReferencia().equals(id)) {
                        throw new IllegalArgumentException("El nombre ya existe en otra referencia.");
                    }
                });

        referencia.setIdReferencia(nuevosDatos.getIdReferencia());
        referencia.setNombre(nuevosDatos.getNombre());
        referencia.setActivo(nuevosDatos.isActivo());

        return referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // ELIMINAR (LÓGICO)
    // ----------------------------------------------------
    public void eliminar(String id) {

        Referencia referencia = referenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La referencia no existe."));

        if (!referencia.isActivo()) {
            throw new IllegalArgumentException("La referencia ya está eliminada.");
        }

        referencia.setActivo(false);
        referenciaRepository.save(referencia);
    }

    // ----------------------------------------------------
    // OBTENER POR ESTADO
    // ----------------------------------------------------
    public List<Referencia> obtenerPorEstado(boolean activo) {
        return referenciaRepository.findByActivo(activo);
    }
}







