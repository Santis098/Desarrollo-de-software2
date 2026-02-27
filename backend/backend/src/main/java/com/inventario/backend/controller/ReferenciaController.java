package com.inventario.backend.controller;

import com.inventario.backend.model.Referencia;
import com.inventario.backend.service.ReferenciaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referencias")
@CrossOrigin(origins = "*")
public class ReferenciaController {

    @Autowired
    private ReferenciaService referenciaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Referencia referencia) {
        try {
            return ResponseEntity.ok(referenciaService.registrar(referencia));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Referencia>> obtenerTodas() {
        return ResponseEntity.ok(referenciaService.obtenerTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<Referencia>> obtenerActivas() {
        return ResponseEntity.ok(referenciaService.obtenerActivas());
    }

    @GetMapping("/inactivas")
    public ResponseEntity<List<Referencia>> obtenerInactivas() {
        return ResponseEntity.ok(referenciaService.obtenerInactivas());
    }

    @GetMapping("/estado/{activo}")
    public ResponseEntity<List<Referencia>> obtenerPorEstado(@PathVariable boolean activo) {
        return ResponseEntity.ok(referenciaService.obtenerPorEstado(activo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(referenciaService.obtenerPorId(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Referencia referencia) {
        try {
            return ResponseEntity.ok(referenciaService.actualizar(id, referencia));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            referenciaService.eliminar(id);
            return ResponseEntity.ok("Referencia eliminada correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
