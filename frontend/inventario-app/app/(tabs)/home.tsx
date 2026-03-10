import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import { DrawerLayout, GestureHandlerRootView } from 'react-native-gesture-handler';
console.log("DrawerLayout:", DrawerLayout);
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRef } from "react";

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const drawerRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      const cargarUsuario = async () => {
        try {
          const data = await AsyncStorage.getItem('usuario');
          if (data) {
            const user = JSON.parse(data);
            setUsuario(user);
          } else {
            router.replace('/login');
          }
        } catch (error) {
          Alert.alert('Error', 'Hubo un problema cargando tu perfil');
          router.replace('/login');
        } finally {
          setLoading(false);
        }
      };

      cargarUsuario();
    }, [router])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('usuario');
      setUsuario(null);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const renderDrawer = () => (
    <SafeAreaView style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Icon name="person-circle-outline" size={80} color="#fff" />
        <Text style={styles.drawerTitle}>{usuario?.nombre}</Text>
        <Text style={styles.drawerSubtitle}>{usuario?.rol}</Text>
      </View>

      <View style={styles.drawerBody}>
        {usuario?.rol === 'ADMIN' ? (
          <>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                drawerRef.current?.closeDrawer();
                router.push('/(admin)/ListaUsuarios');
              }}
            >
              <Icon name="people-outline" size={22} color="#153cc7" />
              <Text style={styles.drawerText}>Lista de Usuarios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                drawerRef.current?.closeDrawer();
                router.push({
                  pathname: '/RegistrarUsuario',
                  params: { rol: usuario.rol, nombre: usuario.nombre },
                });
              }}
            >
              <Icon name="person-add-outline" size={22} color="#153cc7" />
              <Text style={styles.drawerText}>Registrar Usuario</Text>
            </TouchableOpacity>
            
            {/* ---------------- REFERENCIAS ---------------- */}

<TouchableOpacity
  style={styles.drawerItem}
  onPress={() => {
    drawerRef.current?.closeDrawer();
    router.push('/(admin)/ListaReferencias');
  }}
>
  <Icon name="albums-outline" size={22} color="#153cc7" />
  <Text style={styles.drawerText}>Lista de Referencias</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.drawerItem}
  onPress={() => {
    drawerRef.current?.closeDrawer();
    router.push('/(admin)/registrarReferencia');
  }}
>
  <Icon name="add-circle-outline" size={22} color="#153cc7" />
  <Text style={styles.drawerText}>Registrar Referencia</Text>
</TouchableOpacity>

{/* --------- REPUESTOS --------- */}

<TouchableOpacity
  style={styles.drawerItem}
  onPress={() => {
    drawerRef.current?.closeDrawer();
    router.push('/(admin)/ListaRepuestos');
  }}
>
  <Icon name="list-outline" size={22} color="#153cc7" />
  <Text style={styles.drawerText}>Lista de Repuestos</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.drawerItem}
  onPress={() => {
    drawerRef.current?.closeDrawer();
    router.push('/(admin)/RegistrarRepuesto');
  }}
>
  <Icon name="construct-outline" size={22} color="#153cc7" />
  <Text style={styles.drawerText}>Registrar Repuesto</Text>
</TouchableOpacity>

          </>
        ) : (

          

          <View style={{ padding: 20 }}>
            <Text style={{ color: '#555' }}>No tienes permisos de administración.</Text>
          </View>

        )}

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            router.push('/EditarUsuario');
          }}
        >
          <Icon name="create-outline" size={22} color="#153cc7" />
          <Text style={styles.drawerText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.drawerItem, { marginTop: 20 }]}
          onPress={handleLogout}
        >
          <Icon name="exit-outline" size={22} color="red" />
          <Text style={[styles.drawerText, { color: 'red' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!usuario) return null;

  const mainContent = (
    <SafeAreaView style={styles.container}>
      {/* 👇 PATH BAR: Pequeña franja superior */}
      <View style={styles.pathBar}>
        <Text style={styles.pathText}>🏠 Home / Inicio</Text>
      </View>

      {/*  Header principal */}
      <View style={styles.header}>
        <TouchableOpacity
  onPress={() => {
    if (Platform.OS !== "web") {
      drawerRef.current?.openDrawer();
    }
  }}
>
  <Icon name="menu-outline" size={32} color="#153cc7" />
</TouchableOpacity>
        <Text style={styles.headerText}>Inicio</Text>
      </View>

      {/*  Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}> Hola, {usuario.nombre}</Text>
        <Text style={styles.subText}>Cédula: {usuario.cedula}</Text>
        <Text style={styles.subText}>Correo: {usuario.correo}</Text>
        <Text style={styles.subText}>Rol: {usuario.rol}</Text>
      </View>
    </SafeAreaView>
  );

    if (Platform.OS === "web") {
  return mainContent;
}

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={250}
          drawerPosition="left"
          renderNavigationView={renderDrawer}
        >
          {mainContent}
        </DrawerLayout>
      </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  pathBar: {
    backgroundColor: '#e9edf7',
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  pathText: {
    fontSize: 13,
    color: '#4b5563',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#153cc7',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#153cc7',
  },
  subText: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#153cc7',
    alignItems: 'center',
    paddingVertical: 30,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  drawerBody: {
    padding: 15,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  drawerText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#153cc7',
  },
});
