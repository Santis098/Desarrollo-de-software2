import React, { useState, useEffect } from "react";
import {
View,
Text,
FlatList,
Button,
Alert,
StyleSheet,
ActivityIndicator,
Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
obtenerUsuarios,
cambiarEstadoUsuario,
} from "../../services/usuarioService";

export default function ListaUsuarios() {

const router = useRouter();

const [usuarios, setUsuarios] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [loadingId, setLoadingId] = useState<string | null>(null);

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
Alert.alert("Acceso denegado", "Solo los administradores pueden ver esta sección.");
router.replace("/home");
return;
}

cargarUsuarios();

};

/* ============================= */
/* CARGAR USUARIOS */
/* ============================= */

const cargarUsuarios = async () => {

try {

setLoading(true);

const lista = await obtenerUsuarios();

setUsuarios(
Array.isArray(lista)
? lista.sort((a: any, b: any) =>
a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
)
: []
);

} catch (error) {

console.error("Error al cargar usuarios:", error);
Alert.alert("Error", "No se pudo cargar la lista de usuarios.");

} finally {

setLoading(false);

}

};

/* ============================= */
/* CONFIRMAR (WEB + MOBILE) */
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

const toggleEstado = async (usuario: any) => {

const accion = usuario.activo ? "desactivar" : "activar";

const ok = await confirmar(
`¿Seguro que deseas ${accion} a ${usuario.nombre}?`
);

if (!ok) return;

setLoadingId(usuario.idUsuario);

/* actualización inmediata UI */

setUsuarios((prev) =>
prev.map((u) =>
u.idUsuario === usuario.idUsuario
? { ...u, activo: !usuario.activo }
: u
)
);

try {

await cambiarEstadoUsuario(usuario.idUsuario, !usuario.activo);

} catch (error) {

console.error("Error al cambiar estado:", error);

/* revertir si falla */

setUsuarios((prev) =>
prev.map((u) =>
u.idUsuario === usuario.idUsuario
? { ...u, activo: usuario.activo }
: u
)
);

Alert.alert("Error", "No se pudo cambiar el estado del usuario.");

} finally {

setLoadingId(null);

}

};

/* ============================= */
/* RENDER ITEM */
/* ============================= */

const renderUsuario = ({ item }: any) => (

<View style={styles.card}>

<Text style={styles.nombre}>{item.nombre}</Text>

<Text>Rol: {item.rol}</Text>

<Text>Estado: {item.activo ? "Activo" : "Desactivado"}</Text>

<View style={styles.botones}>

<Button
title="Editar"
onPress={() =>
router.push({
pathname: "/EditarUsuarioAdmin",
params: { idUsuario: item.idUsuario },
})
}
/>

<View style={{ width: 120 }}>

{loadingId === item.idUsuario ? ( <ActivityIndicator />
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

return ( <View style={styles.center}> <ActivityIndicator size="large" /> <Text>Cargando usuarios...</Text> </View>
);

}

/* ============================= */
/* UI */
/* ============================= */

return (

<View style={styles.container}>

<Text style={styles.title}>Lista de Usuarios</Text>

<FlatList
data={usuarios}
renderItem={renderUsuario}
keyExtractor={(item) => item.idUsuario.toString()}
ListEmptyComponent={() => (
<Text style={{ textAlign: "center", marginTop: 20 }}>
No hay usuarios </Text>
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
