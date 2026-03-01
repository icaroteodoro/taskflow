import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { message: "Token is required." },
                { status: 400 }
            );
        }

        const verificationToken = await prisma.verificationToken.findFirst({
            where: { token },
            include: { user: true },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { message: "Invalid verification token" },
                { status: 400 }
            );
        }

        if (dayjs().isAfter(dayjs(verificationToken.expiryDate))) {
            return NextResponse.json(
                { message: "Verification token has expired" },
                { status: 400 }
            );
        }

        // Enable the user
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: { enabled: true },
        });

        // Delete the token
        await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
        });

        return NextResponse.json(
            { message: "Conta verificada com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
