import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

import { registrarRepuesto } from "../../services/repuestoService";
import { obtenerReferencias } from "../../services/referenciaService";

const obtenerFechaActual = () => {
  const hoy = new Date();
  return `${String(hoy.getDate()).padStart(2, "0")}/${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}/${hoy.getFullYear()}`;
};

export default function RegistrarRepuesto() {
  const [idRepuesto, setIdRepuesto] = useState("");
  const [nombre, setNombre] = useState("");
  const [fechaRegistro] = useState(obtenerFechaActual());
  const [cantidad, setCantidad] = useState("");
  const [calidad, setCalidad] = useState("NUEVO");
  const [marca, setMarca] = useState("");
  const [estado, setEstado] = useState("EN_BODEGA");

  // NUEVO: lista de referencias
  const [referencias, setReferencias] = useState<any[]>([]);
  const [idReferencia, setIdReferencia] = useState(""); // ya no se escribe, se selecciona

  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // CARGAR REFERENCIAS AL INICIAR
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerReferencias();
        setReferencias(data); // debe ser una lista: [{idReferencia, nombre,...}]
      } catch (err) {
        console.error("Error cargando referencias:", err);
        Alert.alert("Error", "No se pudieron cargar las referencias.");
      }
    };
    cargar();
  }, []);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if ((resultado as any).canceled) return;

    const uri = (resultado as any).assets?.[0]?.uri;
    if (uri) setImagenPreview(uri);
  };

  const resetForm = () => {
    setIdRepuesto("");
    setNombre("");
    setCantidad("");
    setCalidad("NUEVO");
    setMarca("");
    setEstado("EN_BODEGA");
    setIdReferencia("");
    setImagenPreview(null);
  };

  const handleGuardar = async () => {
    if (!idRepuesto.trim() || !nombre.trim() || !cantidad.trim() || !idReferencia) {
      Alert.alert("Campos faltantes", "Completa todos los campos obligatorios.");
      return;
    }

    if (!idRepuesto.toUpperCase().startsWith("RE")) {
      Alert.alert("Código inválido", 'El ID del repuesto debe iniciar con "RE".');
      return;
    }

    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 0) {
      Alert.alert("Cantidad inválida", "Debe ser un número válido.");
      return;
    }

    const payload = {
      idRepuesto: idRepuesto.trim(),
      nombre: nombre.trim(),
      cantidad: cantidadNum,
      calidad,
      marca,
      estado,
      imagen: null,
    };

    try {
      setLoading(true);
      const creado = await registrarRepuesto(idReferencia, payload);
      setLoading(false);

      Alert.alert("Éxito", `Repuesto ${creado.idRepuesto} creado correctamente.`);
      resetForm();
    } catch (err: any) {
      setLoading(false);
      console.error("Error registrar repuesto:", err);
      Alert.alert("Error", err.message ?? "Error desconocido");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Registrar Repuesto</Text>

      {/* ID REpuesto */}
      <Text style={styles.label}>ID Repuesto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: RE001"
        value={idRepuesto}
        onChangeText={(t) => setIdRepuesto(t.toUpperCase())}
      />

      {/* FECHA */}
      <Text style={styles.label}>Fecha de Registro</Text>
      <TextInput style={[styles.input, { backgroundColor: "#e5e7eb" }]} value={fechaRegistro} editable={false} />

      {/* NOMBRE */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      {/* CANTIDAD */}
      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        style={styles.input}
        value={cantidad}
        keyboardType="numeric"
        onChangeText={(t) => setCantidad(t.replace(/[^0-9]/g, ""))}
      />

      {/* SELECTOR DE REFERENCIAS */}
      <Text style={styles.label}>Referencia</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={idReferencia}
          onValueChange={(value) => setIdReferencia(value)}
          style={{ height: 45 }}
        >
          <Picker.Item label="Seleccione una referencia..." value="" />
          {referencias.map((ref) => (
            <Picker.Item
              key={ref.idReferencia}
              label={`${ref.idReferencia} - ${ref.nombre}`}
              value={ref.idReferencia}
            />
          ))}
        </Picker>
      </View>

      {/* MARCA */}
      <Text style={styles.label}>Marca</Text>
      <TextInput style={styles.input} value={marca} onChangeText={setMarca} />

      {/* IMAGEN */}
      <Text style={styles.label}>Imagen (no se guarda)</Text>
      <View style={styles.imageContainer}>
        {imagenPreview ? (
          <Image source={{ uri: imagenPreview }} style={{ width: "100%", height: 200, borderRadius: 10 }} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image-outline" size={40} color="#9ca3af" />
            <Text style={styles.helperText}>Aún no se selecciona imagen</Text>
          </View>
        )}
        <TouchableOpacity style={styles.buttonSecondary} onPress={seleccionarImagen}>
          <Icon name="cloud-upload-outline" size={18} color="#111827" />
          <Text style={styles.buttonSecondaryText}>Adjuntar imagen</Text>
        </TouchableOpacity>
      </View>

      {/* GUARDAR */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleGuardar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonPrimaryText}>Guardar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  pickerContainer: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  marginBottom: 12,
  paddingHorizontal: 5,
  height: 50,
  justifyContent: "center",
},

  container: { flex: 1, backgroundColor: "#F4F6FA", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#153cc7", marginBottom: 16 },
  label: { fontSize: 14, color: "#374151", marginTop: 12, marginBottom: 4 },
  helperText: { fontSize: 12, color: "#6b7280" },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#d1d5db" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#9ca3af", marginRight: 8, marginTop: 4 },
  chipSelected: { backgroundColor: "#153cc7", borderColor: "#153cc7" },
  chipText: { color: "#374151", fontSize: 14 },
  chipTextSelected: { color: "#fff", fontWeight: "bold" },
  imageContainer: { marginTop: 4, marginBottom: 8 },
  imagePlaceholder: { borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", padding: 12, alignItems: "center", marginBottom: 8 },
  buttonPrimary: { marginTop: 24, backgroundColor: "#153cc7", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buttonPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonSecondary: { marginTop: 4, backgroundColor: "#e5e7eb", paddingVertical: 10, borderRadius: 8, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
  buttonSecondaryText: { color: "#111827", fontSize: 14 },
});
