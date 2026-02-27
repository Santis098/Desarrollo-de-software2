// frontend/inventario-app/app/(admin)/editarRepuesto.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { obtenerRepuestoPorId, editarRepuesto } from "../../services/repuestoService";

export default function EditarRepuesto() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const idRepuesto = String(idParam ?? "");

  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // campos
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState<string>("0");
  const [calidad, setCalidad] = useState("");
  const [marca, setMarca] = useState("");
  const [estado, setEstado] = useState("");
  const [idReferencia, setIdReferencia] = useState<string>("");

  const opcionesCalidad = ["Nuevo", "De segunda"];
  const opcionesEstado = ["En bodega", "Para reparar", "En reparación"];

  useEffect(() => {
    if (!idRepuesto) {
      Alert.alert("Error", "Id de repuesto inválido");
      router.back();
      return;
    }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setCargandoDatos(true);
      const rep = await obtenerRepuestoPorId(idRepuesto);

      setNombre(rep.nombre ?? "");
      setCantidad(String(rep.cantidad ?? 0));
      setCalidad(rep.calidad ?? "");
      setMarca(rep.marca ?? "");
      setEstado(rep.estado ?? "");
      setIdReferencia(rep.referencia?.idReferencia ?? "");
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el repuesto.");
      router.back();
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Nombre obligatorio");
      return;
    }
    if (!idReferencia.trim()) {
      Alert.alert("Error", "El repuesto debe tener una referencia válida.");
      return;
    }
    if (!calidad) {
      Alert.alert("Error", "Seleccione la calidad.");
      return;
    }
    if (!estado) {
      Alert.alert("Error", "Seleccione el estado.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        idRepuesto,
        nombre: nombre.trim(),
        cantidad: Number(cantidad) || 0,
        calidad,
        marca,
        estado,
        imagen: null,
      };

      await editarRepuesto(idRepuesto, idReferencia.trim(), payload);

      Alert.alert("Éxito", "Repuesto actualizado correctamente.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Cargando repuesto...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Repuesto</Text>

      <Text style={styles.label}>ID Repuesto</Text>
      <TextInput value={idRepuesto} editable={false} style={[styles.input, { backgroundColor: "#eee" }]} />

      <Text style={styles.label}>Nombre</Text>
      <TextInput value={nombre} onChangeText={setNombre} style={styles.input} />

      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* ----------------------- CALIDAD con botones -------------------------- */}
      <Text style={styles.label}>Calidad</Text>
      <View style={styles.row}>
        {opcionesCalidad.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              calidad === item && styles.optionSelected,
            ]}
            onPress={() => setCalidad(item)}
          >
            <Text
              style={[
                styles.optionText,
                calidad === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Marca</Text>
      <TextInput value={marca} onChangeText={setMarca} style={styles.input} />

      {/* ----------------------- ESTADO con botones --------------------------- */}
      <Text style={styles.label}>Estado</Text>
      <View style={styles.row}>
        {opcionesEstado.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              estado === item && styles.optionSelected,
            ]}
            onPress={() => setEstado(item)}
          >
            <Text
              style={[
                styles.optionText,
                estado === item && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Referencia (ID)</Text>
      <TextInput
        value={idReferencia}
        onChangeText={setIdReferencia}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} />
      ) : (
        <View style={{ marginTop: 14 }}>
          <Button title="Guardar cambios" onPress={handleGuardar} />
          <View style={{ height: 8 }} />
          <Button title="Cancelar" color="#999" onPress={() => router.back()} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginTop: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    marginRight: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  optionText: {
    color: "#333",
    fontSize: 13,
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
});
