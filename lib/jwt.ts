import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "s9f8s9dfs8sdf7s8d7fs7df7s8d9f0s8df7s9df8s9d7f7s98dfs7f9s8dfs79f8s7df8s79fd";
const JWT_EXPIRATION_MS = Number(process.env.JWT_EXPIRATION_MS) || 3600000;

export function generateTokenFromEmail(email: string) {
    return jwt.sign({ sub: email }, JWT_SECRET, {
        expiresIn: Math.floor(JWT_EXPIRATION_MS / 1000), // convert to seconds
    });
}

export function getUserEmailFromJwtToken(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
        return decoded.sub;
    } catch (error) {
        return null;
    }
}

export function validateJwtToken(token: string) {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
}
