import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTokenFromEmail } from "@/lib/jwt";
import dayjs from "dayjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { refreshToken: requestRefreshToken } = body;

        if (!requestRefreshToken) {
            return NextResponse.json(
                { message: "Refresh token is required." },
                { status: 400 }
            );
        }

        const refreshTokenEntity = await prisma.refreshToken.findUnique({
            where: { token: requestRefreshToken },
            include: { user: true },
        });

        if (!refreshTokenEntity) {
            return NextResponse.json(
                { message: "Refresh token is not in database!" },
                { status: 403 }
            );
        }

        if (dayjs().isAfter(dayjs(refreshTokenEntity.expiryDate))) {
            await prisma.refreshToken.delete({
                where: { id: refreshTokenEntity.id },
            });

            return NextResponse.json(
                { message: "Refresh token was expired. Please make a new signin request" },
                { status: 403 }
            );
        }

        const token = generateTokenFromEmail(refreshTokenEntity.user.email);

        return NextResponse.json(
            {
                accessToken: token,
                refreshToken: requestRefreshToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("RefreshToken Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
