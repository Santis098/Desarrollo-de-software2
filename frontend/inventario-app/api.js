import axios from 'axios';

// EXPO_PUBLIC_API_URL se inyecta en build-time (Docker/Render).
// Si no esta definida, se usa el backend publico como fallback.
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://sotfware-ii.onrender.com';

export const api = axios.create({
  baseURL,
  timeout: 10000,
});
