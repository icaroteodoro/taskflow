import api from "@/lib/axios";
import { destroyCookie, parseCookies } from "nookies";
import { getEmailFromToken, saveRefreshToken, saveToken } from "./token-service";
import { iCreateUserRequest, iLoginUserRequest } from "@/types/auth-types";

export async function createUser({
  firstname,
  lastname,
  email,
  password,
}: iCreateUserRequest) {
  try {
    const response = await api.post("/auth/register", {
      firstname,
      lastname,
      email,
      password,
    });

    saveToken(response.data.accessToken);
    saveRefreshToken("refreshToken", response.data.refresh_token);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Erro desconhecido",
    };
  }
}

export async function login({ email, password }: iLoginUserRequest) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    saveToken(response.data.accessToken);
    saveRefreshToken(response.data.refreshToken);
  } catch (error: any) {
    throw error;
  }
  window.location.href = "/home";
}



export function logout() {
  destroyCookie(null, "accessToken");
  destroyCookie(null, "refreshToken");
  window.location.href = "/login";
}