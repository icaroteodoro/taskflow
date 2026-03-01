import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { getUserEmailFromJwtToken } from "@/lib/jwt";

async function authenticate(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    const email = getUserEmailFromJwtToken(token);
    if (!email) return null;

    return prisma.user.findUnique({ where: { email } });
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ goalId: string }> }
) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { goalId } = await params;
        const body = await req.json();
        const { title, totalSteps, targetDate, time, daysOfWeek } = body;

        const existingGoal = await prisma.goal.findUnique({
            where: { id: goalId },
            include: { daysOfWeek: true },
        });

        if (!existingGoal || existingGoal.userId !== user.id) {
            return NextResponse.json({ message: "Goal not found" }, { status: 404 });
        }

        // Delete existing daysOfWeek
        if (daysOfWeek) {
            await prisma.goalDayOfWeek.deleteMany({
                where: { goalId: existingGoal.id },
            });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: existingGoal.id },
            data: {
                title: title || existingGoal.title,
                totalSteps: totalSteps !== undefined ? totalSteps : existingGoal.totalSteps,
                targetDate: targetDate ? dayjs(targetDate).toDate() : existingGoal.targetDate,
                time: time ? dayjs(`1970-01-01T${time}`).toDate() : existingGoal.time,
                daysOfWeek: {
                    create: daysOfWeek?.map((day: string) => ({ dayOfWeek: day })) || [],
                },
            },
            include: {
                daysOfWeek: true,
            },
        });

        const formattedGoal = {
            ...updatedGoal,
            targetDate: updatedGoal.targetDate ? dayjs(updatedGoal.targetDate).format("YYYY-MM-DD") : null,
            time: updatedGoal.time ? dayjs(updatedGoal.time).format("HH:mm") : null,
        };

        return NextResponse.json(formattedGoal, { status: 200 });
    } catch (error) {
        console.error("Update Goal Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ goalId: string }> }
) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { goalId } = await params;

        const existingGoal = await prisma.goal.findUnique({
            where: { id: goalId },
        });

        if (!existingGoal || existingGoal.userId !== user.id) {
            return NextResponse.json({ message: "Goal not found" }, { status: 404 });
        }

        await prisma.goal.delete({
            where: { id: existingGoal.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Delete Goal Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
