import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import dayjs from "dayjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email and password are required component." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Error: Email is already in use!" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                enabled: false, // Require email verification
            },
        });

        const token = crypto.randomUUID();
        const expiryDate = dayjs().add(24, "hour").toDate();

        await prisma.verificationToken.create({
            data: {
                token,
                userId: user.id,
                expiryDate,
            },
        });

        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/verify-email?token=${token}`;

        const html = `Obrigado por se registrar no Taskflow. Por favor, clique no link abaixo para verificar sua conta:<br/><br/><a href="${verificationUrl}">${verificationUrl}</a><br/><br/>Este link expirará em 24 horas.`;

        await sendEmail({
            to: user.email,
            subject: "Bem-vindo ao Taskflow! Por favor, verifique seu e-mail.",
            html,
        });

        return NextResponse.json(
            { message: "Usuário registrado com sucesso! Verifique seu e-mail." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
