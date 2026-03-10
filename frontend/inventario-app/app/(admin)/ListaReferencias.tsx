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
Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
obtenerReferenciasActivas,
obtenerReferenciasInactivas,
actualizarReferencia,
} from "../../services/referenciaService";

export default function ListaReferencias() {

const router = useRouter();

const [referencias, setReferencias] = useState<any[]>([]);
const [searchText, setSearchText] = useState("");
const [loading, setLoading] = useState(true);
const [loadingId, setLoadingId] = useState<string | null>(null);
const [mostrarActivas, setMostrarActivas] = useState(true);

/* ============================= */
/* VERIFICAR USUARIO */
/* ============================= */

useEffect(() => {
verificarUsuario();
}, []);

const verificarUsuario = async () => {

const data = await AsyncStorage.getItem("usuario");

if (!data) {
Alert.alert("Sesión expirada", "Debes iniciar sesión nuevamente.");
router.replace("/login");
return;
}

const user = JSON.parse(data);

if (user.rol !== "ADMIN") {
Alert.alert("Acceso denegado");
router.replace("/home");
return;
}

cargarReferencias();
};

/* ============================= */
/* CARGAR REFERENCIAS */
/* ============================= */

useEffect(() => {
cargarReferencias();
}, [mostrarActivas]);

const cargarReferencias = async () => {

try {

setLoading(true);

const lista = mostrarActivas
? await obtenerReferenciasActivas()
: await obtenerReferenciasInactivas();

setReferencias(
Array.isArray(lista)
? lista.sort((a: any, b: any) =>
a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
)
: []
);

} catch (error) {

console.error(error);
Alert.alert("Error", "No se pudieron cargar las referencias");

} finally {

setLoading(false);

}

};

/* ============================= */
/* FILTRO */
/* ============================= */

const referenciasFiltradas = referencias.filter((ref) => {

const q = searchText.toLowerCase();

return (
ref.nombre.toLowerCase().includes(q) ||
String(ref.idReferencia).toLowerCase().includes(q)
);

});

/* ============================= */
/* CONFIRMAR ACCION */
/* ============================= */

const confirmar = async (mensaje: string) => {

if (Platform.OS === "web") {
return window.confirm(mensaje);
}

return new Promise((resolve) => {

Alert.alert("Confirmar", mensaje, [
{ text: "Cancelar", onPress: () => resolve(false) },
{ text: "Aceptar", onPress: () => resolve(true) },
]);

});

};

/* ============================= */
/* ACTIVAR / DESACTIVAR */
/* ============================= */

const toggleEstado = async (ref: any) => {

const accion = ref.activo ? "desactivar" : "activar";

const ok = await confirmar(`¿Seguro que deseas ${accion} "${ref.nombre}"?`);

if (!ok) return;

setLoadingId(ref.idReferencia);

/* actualización inmediata UI */

setReferencias((prev) =>
prev.map((r) =>
r.idReferencia === ref.idReferencia
? { ...r, activo: !r.activo }
: r
)
);

try {

await actualizarReferencia(ref.idReferencia, {
idReferencia: ref.idReferencia,
nombre: ref.nombre,
activo: !ref.activo,
});

} catch (error) {

console.error(error);

/* revertir si falla */

setReferencias((prev) =>
prev.map((r) =>
r.idReferencia === ref.idReferencia
? { ...r, activo: ref.activo }
: r
)
);

Alert.alert("Error", "No se pudo actualizar la referencia");

} finally {

setLoadingId(null);

}

};

/* ============================= */
/* RENDER ITEM */
/* ============================= */

const renderItem = ({ item }: any) => (

<View style={styles.card}>

<Text style={styles.nombre}>{item.nombre}</Text>

<Text>ID: {item.idReferencia}</Text>

<Text>Estado: {item.activo ? "Activa" : "Inactiva"}</Text>

<View style={styles.botones}>

<Button
title="Editar"
onPress={() =>
router.push({
pathname: "/editarReferencia",
params: { idReferencia: item.idReferencia },
})
}
/>

<View style={{ width: 120 }}>

{loadingId === item.idReferencia ? ( <ActivityIndicator />
) : (
<Button
title={item.activo ? "Desactivar" : "Activar"}
color={item.activo ? "red" : "green"}
onPress={() => toggleEstado(item)}
/>
)}

</View>

</View>

</View>

);

/* ============================= */
/* LOADING */
/* ============================= */

if (loading) {

return ( <View style={styles.center}> <ActivityIndicator size="large" /> <Text>Cargando referencias...</Text> </View>
);

}

/* ============================= */
/* UI */
/* ============================= */

return (

<View style={styles.container}>

<Text style={styles.title}>Lista de Referencias</Text>

<Button
title={
mostrarActivas
? "Mostrando ACTIVAS (ver INACTIVAS)"
: "Mostrando INACTIVAS (ver ACTIVAS)"
}
onPress={() => setMostrarActivas(!mostrarActivas)}
color={mostrarActivas ? "green" : "red"}
/>

<TextInput
style={styles.input}
placeholder="Buscar referencia..."
value={searchText}
onChangeText={setSearchText}
/>

<FlatList
data={referenciasFiltradas}
renderItem={renderItem}
keyExtractor={(item) => item.idReferencia}
ListEmptyComponent={() => (
<Text style={{ textAlign: "center", marginTop: 20 }}>
No hay referencias </Text>
)}
/>

</View>

);

}

/* ============================= */
/* ESTILOS */
/* ============================= */

const styles = StyleSheet.create({

container: {
flex: 1,
padding: 15,
backgroundColor: "#fff",
},

center: {
flex: 1,
justifyContent: "center",
alignItems: "center",
},

title: {
fontSize: 22,
fontWeight: "bold",
textAlign: "center",
marginBottom: 10,
},

input: {
borderWidth: 1,
borderColor: "#aaa",
padding: 10,
borderRadius: 8,
marginVertical: 10,
},

card: {
borderWidth: 1,
borderColor: "#ccc",
padding: 15,
borderRadius: 8,
marginBottom: 10,
},

nombre: {
fontWeight: "bold",
fontSize: 16,
},

botones: {
flexDirection: "row",
justifyContent: "space-between",
marginTop: 10,
},

});
