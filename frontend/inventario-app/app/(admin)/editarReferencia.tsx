// editarReferencia.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  obtenerReferenciaPorId
} from "../../services/referenciaService"; // asegúrate ruta correcta

import { editarReferencia } from "../../services/referenciaService";


export default function EditarReferencia() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // params.idReferencia es el que enviamos desde la lista
  const idParam = Array.isArray(params.idReferencia)
    ? params.idReferencia[0]
    : (params.idReferencia as string | undefined);

  // -- estado --
  // originalIdReferencia: IDENTIFICADOR que se usará para llamar al backend (NO editable)
  const [originalIdReferencia, setOriginalIdReferencia] = useState<string | null>(
    idParam ?? null
  );

  // campos del formulario (solo nombre y activo editables)
  const [idReferenciaVisible, setIdReferenciaVisible] = useState<string>(""); // solo para mostrar
  const [nombre, setNombre] = useState<string>("");
  const [activo, setActivo] = useState<boolean>(true);

  const [usuario, setUsuario] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      // validar sesión
      const data = await AsyncStorage.getItem("usuario");
      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión.");
        router.replace("/login");
        return;
      }
      const user = JSON.parse(data);
      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "No tienes permisos para editar referencias.");
        router.replace("/home");
        return;
      }
      setUsuario(user);

      // validar param
      if (!originalIdReferencia) {
        Alert.alert("Error", "ID de referencia no proporcionado.");
        router.back();
        return;
      }

      try {
        setLoading(true);
        // obtener referencia desde backend (id como string)
        const referencia = await obtenerReferenciaPorId(originalIdReferencia);
        // llenar formulario (no permitimos editar el id en este caso)
        setIdReferenciaVisible(referencia.idReferencia ?? originalIdReferencia);
        setNombre(referencia.nombre ?? "");
        setActivo(Boolean(referencia.activo));
      } catch (err) {
        console.error("Error cargando referencia:", err);
        Alert.alert("Error", "No se pudo cargar la referencia.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalIdReferencia]);

  const handleActualizar = async () => {
    const nombreNorm = String(nombre || "").trim();

    if (!nombreNorm) {
      Alert.alert("Error", "El nombre de la referencia es obligatorio.");
      return;
    }

    if (!originalIdReferencia) {
      Alert.alert("Error", "ID original no disponible. Reabre la pantalla.");
      return;
    }

    const payload = {
      idReferencia: originalIdReferencia, // backend requiere idReferencia en payload (según tu Java)
      nombre: nombreNorm,
      activo: activo,
    };

    try {
      setLoading(true);
      // Importante: pasar EXACTAMENTE originalIdReferencia (string)
      console.log("Llamando a actualizarReferencia con id =", originalIdReferencia, "payload =", payload);
      await editarReferencia(originalIdReferencia, payload);

      Alert.alert("Éxito", "Referencia actualizada correctamente.");
      // volver a la lista o la ruta que uses
      router.push("/home");
    } catch (error: any) {
      console.error("Error al actualizar referencia:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "No se pudo actualizar la referencia.";
      Alert.alert("Error", String(message));
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Referencia</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={{ marginBottom: 6 }}>ID de referencia (no editable)</Text>
          <TextInput
            value={idReferenciaVisible}
            style={[styles.input, { backgroundColor: "#f0f0f0", color: "#333" }]}
            editable={false}
            selectTextOnFocus={false}
          />

          <Text style={{ marginBottom: 6 }}>Nombre</Text>
          <TextInput
            placeholder="Nombre de la referencia"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Activo</Text>
            <Switch value={activo} onValueChange={setActivo} />
          </View>

          <Button title="Guardar cambios" onPress={handleActualizar} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  label: { fontSize: 16, marginRight: 10 },
});
