import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateTokenFromEmail } from "@/lib/jwt";
import crypto from "crypto";
import dayjs from "dayjs";

// Matching the Java `jwt.refreshExpirationMs` default (86400000ms = 24 hours)
const REFRESH_EXPIRATION_HOURS =
    Number(process.env.JWT_REFRESH_EXPIRATION_HOURS) || 24;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (!user.enabled) {
            return NextResponse.json(
                { message: "Account is not verified. Check your email." },
                { status: 403 }
            );
        }

        const jwt = generateTokenFromEmail(user.email);

        // Delete existing refresh tokens
        await prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });

        // Create a new one
        const refreshTokenStr = crypto.randomUUID();
        const expiryDate = dayjs().add(REFRESH_EXPIRATION_HOURS, "hour").toDate();

        const refreshToken = await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshTokenStr,
                expiryDate,
            },
        });

        return NextResponse.json(
            {
                token: jwt,
                type: "Bearer",
                id: user.id,
                name: user.name,
                email: user.email,
                refreshToken: refreshToken.token,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
