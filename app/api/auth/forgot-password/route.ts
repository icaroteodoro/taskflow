import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import dayjs from "dayjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { message: "Email is required." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, do not reveal if email exists. Still return 200.
            return NextResponse.json(
                { message: "Se a conta existir, um e-mail de redefinição de senha foi enviado." },
                { status: 200 }
            );
        }

        // Delete any existing tokens
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        const token = crypto.randomUUID();
        const expiryDate = dayjs().add(1, "hour").toDate();

        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiryDate,
            },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/reset-password?token=${token}`;

        const html = `Você solicitou uma redefinição de senha. Por favor, clique no link abaixo para criar uma nova senha:<br/><br/><a href="${resetUrl}">${resetUrl}</a><br/><br/>Este link expirará em 1 hora. Se você não solicitou isso, por favor ignore este e-mail.`;

        await sendEmail({
            to: user.email,
            subject: "Taskflow - Solicitação de Redefinição de Senha",
            html,
        });

        return NextResponse.json(
            { message: "Se a conta existir, um e-mail de redefinição de senha foi enviado." },
            { status: 200 }
        );
    } catch (error) {
        console.error("ForgotPassword Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
