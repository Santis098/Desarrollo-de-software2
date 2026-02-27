import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registrarReferencia } from "../../services/referenciaService"; // ← asegúrate que la ruta coincide

export default function RegistrarReferencia() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  // Ahora usamos idReferencia (string) en vez de codigo
  const [idReferencia, setIdReferencia] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Verificar sesión y rol
  const verificarAcceso = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");

      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(data);

      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "Solo un admin puede crear referencias.");
        router.replace("/home");
        return;
      }

      setUsuario(user);
    } catch (error) {
      console.error("Error verificando sesión:", error);
    }
  };

  useEffect(() => {
    verificarAcceso();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      verificarAcceso();
    }, [])
  );

  const handleRegistrar = async () => {
    const idRefNormalized = String(idReferencia || "").trim();
    const nombreNormalized = String(nombre || "").trim();

    // Validaciones: idReferencia y nombre obligatorios
    if (!idRefNormalized || !nombreNormalized) {
      Alert.alert("Error", "Por favor completa el ID de referencia y el nombre.");
      return;
    }

    // Si quieres añadir validación de formato (opcional), descomenta y edita la siguiente línea:
    // const regex = /^RF\d+$/i; if (!regex.test(idRefNormalized)) { Alert.alert("ID inválido", "Ej: RF01"); return; }

    try {
      setLoading(true);

      const payload = {
        idReferencia: idRefNormalized,
        nombre: nombreNormalized,
        activo: true, // por defecto
      };

      console.log("Payload registrar referencia:", payload);

      // Llama al service (asegúrate que registrarReferencia en el service acepta este payload)
      const response = await registrarReferencia(payload);

      console.log("Respuesta backend registrar referencia:", response);

      // Ajusta el mensaje según lo que devuelva tu backend; usamos idReferencia por defecto
      const createdId = response?.idReferencia ?? response?.idReferencia ?? idRefNormalized;
      Alert.alert("Éxito", `Referencia ${createdId} creada correctamente`);
      router.push("/home");
    } catch (error: any) {
      // manejo de errores más robusto
      console.error("Error al crear referencia:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo crear la referencia. Verifica la conexión y los datos.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Referencia</Text>

      <TextInput
        placeholder="Nombre de la referencia"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="ID de referencia (Ej: RF01)"
        value={idReferencia}
        autoCapitalize="characters"
        onChangeText={setIdReferencia}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Button title="Registrar" onPress={handleRegistrar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
