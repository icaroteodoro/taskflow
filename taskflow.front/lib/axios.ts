import axios from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";

import jwt from "jsonwebtoken";
import { getAccessToken } from "@/services/token-service";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Funções auxiliares para manipular tokens
function getToken(ctx = null) {
  return parseCookies(ctx).accessToken;
}

function saveToken(accessToken: string, ctx = null) {
  setCookie(ctx, "accessToken", accessToken, { maxAge: 60 * 60 * 24 * 7, path: "/" });
}

function getRefreshToken(ctx = null) {
  return parseCookies(ctx).refreshToken;
}

function saveRefreshToken(refreshToken: string, ctx = null) {
  setCookie(ctx, "refreshToken", refreshToken, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

function logout() {
  destroyCookie(null, "accessToken");
  destroyCookie(null, "refreshToken");
  window.location.href = "/login";
}

export function isTokenExpired(accessToken: string): boolean {
  if (!accessToken) return true; // Se não houver accessToken, consideramos como expirado

  try {
    const decoded: any = jwt.decode(accessToken);
    if (!decoded || !decoded.exp) return true; // Se não conseguir decodificar ou não tiver exp, consideramos expirado

    const currentTime = Math.floor(Date.now() / 1000); // Tempo atual em segundos
    return decoded.exp < currentTime; // Retorna true se o accessToken já expirou
  } catch (error) {
    return true; // Se houver erro na decodificação, considera como expirado
  }
}

// Interceptador para adicionar o accessToken JWT em cada requisição
api.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if(!accessToken) return config; 

    if (isTokenExpired(accessToken)) {
      if(isTokenExpired(refreshToken)){
        logout()
      }else{
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );
  
        const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
        saveToken(newToken);
        saveRefreshToken(newRefreshToken);
  
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;