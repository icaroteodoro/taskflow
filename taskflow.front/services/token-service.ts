import { parseCookies, setCookie, destroyCookie } from "nookies";
import jwt from "jsonwebtoken";


export function getAccessToken(ctx = null) {
  return parseCookies(ctx).accessToken;
}

export function getEmailFromToken(ctx?: any) {
  const accessToken = getAccessToken();

    if (!accessToken) {
        return;
    }

    const email = jwt.decode(accessToken)?.sub;
    return email;
}

export function saveToken(accessToken: string, ctx = null) {
  setCookie(ctx, "accessToken", accessToken, { maxAge: 60 * 60 * 24 * 7, path: "/" });
}

export function getRefreshToken(ctx = null) {
  return parseCookies(ctx).refreshToken;
}

export function saveRefreshToken(refreshToken: string, ctx = null) {
  setCookie(ctx, "refreshToken", refreshToken, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}


export function isTokenExpired(accessToken: string): boolean {
  if (!accessToken) return true;

  try {
    const decoded: any = jwt.decode(accessToken);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}