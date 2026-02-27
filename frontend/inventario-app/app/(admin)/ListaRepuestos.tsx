// ListaRepuestos.tsx (reemplaza tu versión actual)
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Repuesto } from "../../types/repuesto";
import EditarRepuesto from "./editarRepuesto";

const API_BASE_URL = "http://192.168.1.7:8080"; // tu IP

const ListaRepuestos = () => {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal eliminar cantidad
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRepuestoId, setSelectedRepuestoId] = useState<string | null>(null);
  const [cantidadEliminar, setCantidadEliminar] = useState<string>("");

  useEffect(() => {
    cargarRepuestos();
  }, []);

  const cargarRepuestos = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/api/repuesto/listar`);
      const data = await resp.json();
      setRepuestos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando repuestos:", error);
      Alert.alert("Error", "No se pudieron cargar los repuestos");
    } finally {
      setLoading(false);
    }
  };

  const filtrar = () => {
    const q = busqueda.trim().toLowerCase();
    const refQ = filtroReferencia.trim().toLowerCase();

    return repuestos.filter((item) => {
      const nombre = (item.nombre ?? "").toString().toLowerCase();
      const idRef = (item.referencia?.idReferencia ?? "").toString().toLowerCase();

      const matchNombre = q === "" ? true : nombre.includes(q);
      const matchReferencia = refQ === "" ? true : idRef.includes(refQ);

      return matchNombre && matchReferencia;
    });
  };

const onEditar = (idRepuesto: string) => {
  router.push(`../../editarRepuesto/${idRepuesto}`);
};


  // Abrir modal
  const abrirEliminarCantidad = (idRepuesto: string) => {
    setSelectedRepuestoId(idRepuesto);
    setCantidadEliminar("");
    setModalVisible(true);
  };

  // Ejecutar eliminación de cantidad
  const confirmarEliminarCantidad = async () => {
    if (!selectedRepuestoId) return;
    const cantidadNum = parseInt(cantidadEliminar, 10);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert("Cantidad inválida", "Ingresa un número mayor que 0");
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Eliminar ${cantidadNum} unidades del repuesto ${selectedRepuestoId}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setModalVisible(false);
              setLoading(true);

              const resp = await fetch(
                `${API_BASE_URL}/api/repuesto/eliminarCantidad/${encodeURIComponent(
                  selectedRepuestoId
                )}/${cantidadNum}`,
                { method: "PUT" }
              );

              if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(txt || "Error al eliminar cantidad");
              }

              Alert.alert("Éxito", `Se eliminaron ${cantidadNum} unidades.`);
              await cargarRepuestos();
            } catch (err: any) {
              console.error("Error eliminar cantidad:", err);
              Alert.alert("Error", err.message || "No se pudo eliminar la cantidad");
            } finally {
              setLoading(false);
              setSelectedRepuestoId(null);
              setCantidadEliminar("");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Repuesto }) => {
    const imagenUri = item.imagen
      ? `${API_BASE_URL}/api/repuesto/uploads/${encodeURIComponent(item.imagen)}`
      : null;

    return (
      <View style={styles.card}>
        {imagenUri ? (
          <Image source={{ uri: imagenUri }} style={styles.imagen} />
        ) : (
          <View style={styles.sinImagen}>
            <Icon name="image-outline" size={40} color="#9ca3af" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{item.nombre}</Text>
          <Text style={styles.texto}>ID Repuesto: {item.idRepuesto}</Text>
          <Text style={styles.texto}>Cantidad: {item.cantidad}</Text>
          <Text style={styles.texto}>
            Referencia: {item.referencia?.idReferencia ?? "-"}
          </Text>
          <Text style={styles.estado}>{item.estado}</Text>
        </View>

        {/* Botones editar (azul) y eliminar (rojo) */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() => router.push({
              pathname: "/editarRepuesto",
              params: { id: item.idRepuesto }
            })}
            >
              <Icon name="pencil" size={18} color="#fff" />
            </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => abrirEliminarCantidad(item.idRepuesto)}
          >
            <Icon name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Repuestos</Text>

      <TextInput
        placeholder="Buscar por nombre..."
        style={styles.input}
        value={busqueda}
        onChangeText={setBusqueda}
        autoCapitalize="none"
        keyboardType="default"
      />

      <TextInput
        placeholder="Filtrar por referencia (ID)..."
        style={styles.input}
        keyboardType="default"
        value={filtroReferencia}
        onChangeText={setFiltroReferencia}
        autoCapitalize="characters"
      />

      <FlatList
        data={filtrar()}
        keyExtractor={(item) => item.idRepuesto}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 24, alignItems: "center" }}>
            <Text>No hay repuestos que coincidan</Text>
          </View>
        )}
      />

      {/* Modal eliminar cantidad */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.modal}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Eliminar cantidad</Text>
            <Text>Ingrese la cantidad a eliminar:</Text>

            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Cantidad (número)"
              value={cantidadEliminar}
              onChangeText={setCantidadEliminar}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity
                style={[modalStyles.btn, { backgroundColor: "#ccc", marginRight: 8 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[modalStyles.btn, { backgroundColor: "#DC2626" }]} onPress={confirmarEliminarCantidad}>
                <Text style={{ color: "#fff" }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F6FA",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#153cc7",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  sinImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  texto: {
    color: '#374151',
  },
  estado: {
    marginTop: 4,
    backgroundColor: '#153cc7',
    color: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonsContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#1E40AF',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
});

export default ListaRepuestos;
