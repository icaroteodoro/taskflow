import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return NextResponse.json(
                { message: "Token and new password are required." },
                { status: 400 }
            );
        }

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { token },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json(
                { message: "Invalid reset token" },
                { status: 400 }
            );
        }

        if (dayjs().isAfter(dayjs(resetToken.expiryDate))) {
            return NextResponse.json(
                { message: "Reset token has expired" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        // Delete token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return NextResponse.json(
            { message: "Senha alterada com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("ResetPassword Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
