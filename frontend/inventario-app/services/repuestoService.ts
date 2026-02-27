// frontend/inventario-app/services/repuestoService.ts
const API_BASE_URL = "http://192.168.1.7:8080";

export type RepuestoPayload = {
  idRepuesto: string;
  nombre: string;
  cantidad: number;
  calidad: string;
  marca: string;
  estado: string;
  referencia?: { idReferencia: string } | string;
  imagen?: string | null; // queda pero YA NO se usa
};

export const obtenerReferencias = async () => {
  const resp = await fetch("http://192.168.1.7:8080/api/referencias");
  if (!resp.ok) throw new Error("Error al cargar referencias");
  return resp.json();
};

// ----------------------------------------------------
// OBTENER REPUESTO POR ID
// ----------------------------------------------------
export const obtenerRepuestoPorId = async (idRepuesto: string): Promise<any> => {
  const resp = await fetch(`${API_BASE_URL}/api/repuesto/${idRepuesto}`);
  if (!resp.ok) throw new Error(`Error ${resp.status}`);
  return resp.json();
};

// ----------------------------------------------------
// REGISTRAR REPUESTO (SIN IMAGEN)
// ----------------------------------------------------
export const registrarRepuesto = async (
  idReferencia: string,
  datos: RepuestoPayload
) => {
  const resp = await fetch(
    `${API_BASE_URL}/api/repuesto/registrar/${encodeURIComponent(idReferencia)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error ${resp.status}: ${text}`);
  }

  return resp.json();
};

// ----------------------------------------------------
// EDITAR REPUESTO (YA SIN IMAGEN)
// ----------------------------------------------------
export const editarRepuesto = async (
  idRepuesto: string,
  idReferencia: string,
  datos: Omit<RepuestoPayload, "referencia">
) => {
  const repuestoObj = {
    ...datos,
    referencia: { idReferencia },
  };

  const resp = await fetch(
    `${API_BASE_URL}/api/repuesto/editar/${encodeURIComponent(idRepuesto)}/${encodeURIComponent(idReferencia)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repuestoObj),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error ${resp.status}: ${text}`);
  }

  return resp.json();
  
};
