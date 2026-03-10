import { api } from '../api';
import { Referencia } from '../types/referencia';

// 🔹 Listar TODAS (activas + inactivas)
export const obtenerReferencias = async (): Promise<Referencia[]> => {
  const response = await api.get('/api/referencias');
  return response.data;
};

// 🔹 Obtener referencia por ID
export const obtenerReferenciaPorId = async (id: number | string): Promise<Referencia> => {
  const response = await api.get(`/api/referencias/${id}`);
  return response.data;
};

// 🔹 Registrar referencia
export const registrarReferencia = async (
  referencia: Partial<Referencia>
): Promise<Referencia> => {

  const payload = {
    idReferencia: referencia.idReferencia,
    nombre: referencia.nombre,
    activo: referencia.activo ?? true
  };

  const response = await api.post('/api/referencias/registrar', payload);
  return response.data;
};


// 🔹 Actualizar referencia
export const editarReferencia = async (idReferencia: string, nuevosDatos: any) => {
  return api.put(`/api/referencias/${encodeURIComponent(idReferencia)}`, nuevosDatos);
};

export const actualizarReferencia = async (id: string, referencia: any) => {
  const response = await api.put(`/api/referencias/${id}`, referencia);
  return response.data;
};

// 🔹 Obtener SOLO activas
export const obtenerReferenciasActivas = async (): Promise<Referencia[]> => {
  const response = await api.get("/api/referencias/activas");
  return response.data;
};

// 🔹 Obtener SOLO inactivas
export const obtenerReferenciasInactivas = async (): Promise<Referencia[]> => {
  const response = await api.get("/api/referencias/inactivas");
  return response.data;
};

// 🔹 Obtener por estado dinámico (true o false)
export const obtenerReferenciasPorEstado = async (activo: boolean): Promise<Referencia[]> => {
  const response = await api.get(`/api/referencias/estado/${activo}`);
  return response.data;
};
