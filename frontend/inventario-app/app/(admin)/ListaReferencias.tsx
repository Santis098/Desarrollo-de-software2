import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
  obtenerReferenciasActivas,
  obtenerReferenciasInactivas,
  obtenerReferenciaPorId,
  actualizarReferencia
} from "../../services/referenciaService";

export default function ListaReferencias() {
  const [referencias, setReferencias] = useState<any[]>([]);
  const [referenciasFiltradas, setReferenciasFiltradas] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [usuarioActual, setUsuarioActual] = useState<any | null>(null);

  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingAccionId, setLoadingAccionId] = useState<string | null>(null);

  const [mostrarActivas, setMostrarActivas] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarYcargar = async () => {

      console.log("===== VERIFICANDO USUARIO =====");

      const data = await AsyncStorage.getItem("usuario");

      console.log("Usuario en AsyncStorage:", data);

      if (!data) {
        Alert.alert("Sesión expirada", "Debes iniciar sesión nuevamente.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(data);

      console.log("Usuario parseado:", user);

      setUsuarioActual(user);

      if (user.rol !== "ADMIN") {
        Alert.alert("Acceso denegado", "Solo los administradores pueden ver esta sección.");
        router.replace("/home");
        return;
      }

      await cargarReferencias();
    };

    verificarYcargar();
  }, [mostrarActivas]);

  const cargarReferencias = async () => {

    console.log("===== CARGANDO REFERENCIAS =====");

    try {
      setLoadingLista(true);

      let lista = mostrarActivas
        ? await obtenerReferenciasActivas()
        : await obtenerReferenciasInactivas();

      console.log("Referencias recibidas del backend:", lista);

      const listaOrdenada = Array.isArray(lista)
        ? lista.sort((a: any, b: any) =>
            String(a.nombre).localeCompare(String(b.nombre), "es", { sensitivity: "base" })
          )
        : [];

      console.log("Referencias ordenadas:", listaOrdenada);

      setReferencias(listaOrdenada);
      setReferenciasFiltradas(listaOrdenada);

    } catch (error) {

      console.error("ERROR AL CARGAR REFERENCIAS:");
      console.error(error);

      Alert.alert("Error", "No se pudo cargar la lista de referencias.");

    } finally {

      setLoadingLista(false);
    }
  };

  useEffect(() => {

    console.log("===== FILTRANDO REFERENCIAS =====");

    const q = (searchText || "").trim().toLowerCase();

    console.log("Texto búsqueda:", q);

    if (q === "") {
      setReferenciasFiltradas(referencias);
      return;
    }

    const lista = referencias.filter((ref) => {
      const idRef = String(ref.idReferencia ?? "").toLowerCase();
      const nombre = String(ref.nombre ?? "").toLowerCase();

      return idRef.includes(q) || nombre.includes(q);
    });

    console.log("Resultado filtrado:", lista);

    setReferenciasFiltradas(lista);

  }, [searchText, referencias]);

  const toggleEstado = (ref: any) => {

    console.log("===== TOGGLE ESTADO =====");
    console.log("Referencia recibida:", ref);

    Alert.alert(
      ref.activo ? "Desactivar referencia" : "Activar referencia",
      `¿Estás seguro de ${ref.activo ? "desactivar" : "activar"} "${ref.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {

            console.log("Usuario confirmó acción");

            setLoadingAccionId(ref.idReferencia);

            try {

              const payload = {
                idReferencia: ref.idReferencia,
                nombre: ref.nombre,
                activo: !ref.activo,
              };

              console.log("Payload a enviar:");
              console.log(payload);

              console.log("Llamando API actualizarReferencia...");

              const response = await actualizarReferencia(ref.idReferencia, payload);

              console.log("Respuesta backend:");
              console.log(response);

              Alert.alert(
                "Éxito",
                `Referencia ${payload.activo ? "activada" : "desactivada"} correctamente.`
              );

              console.log("Recargando referencias...");

              await cargarReferencias();

            } catch (error: any) {

              console.error("===== ERROR AL CAMBIAR ESTADO =====");
              console.error(error);

              if (error?.response) {
                console.error("Respuesta backend:", error.response.data);
                console.error("Status:", error.response.status);
              }

              Alert.alert("Error", "No se pudo cambiar el estado.");

            } finally {

              console.log("Finalizó toggle estado");

              setLoadingAccionId(null);
            }
          },
        },
      ]
    );
  };

  const renderReferencia = ({ item }: { item: any }) => (

    <View style={styles.card}>

      <Text style={styles.nombre}>{item.nombre}</Text>

      <Text>ID Referencia: {String(item.idReferencia)}</Text>
      <Text>Estado: {item.activo ? "Activa" : "Inactiva"}</Text>

      <View style={styles.botones}>

        <Button
          title="Editar"
          onPress={() => {

            console.log("Ir a editar referencia:", item.idReferencia);

            router.push({
              pathname: "/editarReferencia",
              params: { idReferencia: item.idReferencia },
            });

          }}
        />

        <View style={{ width: 120 }}>

          {loadingAccionId === item.idReferencia ? (

            <ActivityIndicator size="small" />

          ) : (

            <Button
              title={item.activo ? "Desactivar" : "Activar"}
              color={item.activo ? "red" : "green"}
              onPress={() => {

                console.log("CLICK BOTON REFERENCIA:", item);

                toggleEstado(item);

              }}
            />

          )}

        </View>

      </View>

    </View>
  );

  if (loadingLista) {

    console.log("Pantalla en estado loading...");

    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <Text>Cargando referencias...</Text>
      </View>
    );
  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Lista de Referencias</Text>

      <Button
        title={
          mostrarActivas
            ? "Mostrando: ACTIVAS (ver INACTIVAS)"
            : "Mostrando: INACTIVAS (ver ACTIVAS)"
        }
        onPress={() => {

          console.log("Toggle mostrarActivas:", !mostrarActivas);

          setMostrarActivas(!mostrarActivas);

        }}
        color={mostrarActivas ? "green" : "red"}
      />

      <TextInput
        style={styles.input}
        placeholder="Buscar por idReferencia o nombre..."
        value={searchText}
        onChangeText={(text) => {

          console.log("Texto búsqueda:", text);

          setSearchText(text);

        }}
        autoCapitalize="characters"
      />

      <FlatList
        data={referenciasFiltradas}
        renderItem={renderReferencia}
        keyExtractor={(item) => String(item.idReferencia)}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            No hay referencias {mostrarActivas ? "activas" : "inactivas"}.
          </Text>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nombre: { fontWeight: "bold", fontSize: 16 },
  botones: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});