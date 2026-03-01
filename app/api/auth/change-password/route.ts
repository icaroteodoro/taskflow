import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserEmailFromJwtToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        // Basic Custom JWT Extraction Middleware Logic
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { message: "Unauthorized: Missing or invalid token" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        const email = getUserEmailFromJwtToken(token);

        if (!email) {
            return NextResponse.json(
                { message: "Unauthorized: Invalid token" },
                { status: 401 }
            );
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "Current and new passions are required." },
                { status: 400 }
            );
        }

        // Validate current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Incorrect current password" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json(
            { message: "Senha alterada com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("ChangePassword Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
