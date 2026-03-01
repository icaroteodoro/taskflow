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

export async function POST(
    req: Request,
    { params }: { params: Promise<{ goalId: string }> }
) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("date");

        if (!dateQuery) {
            return NextResponse.json(
                { message: "Date parameter is required." },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { completedSteps } = body;

        const { goalId } = await params;
        const date = dayjs(dateQuery).startOf("day").toDate();

        const existingGoal = await prisma.goal.findUnique({
            where: { id: goalId },
        });

        if (!existingGoal || existingGoal.userId !== user.id) {
            return NextResponse.json({ message: "Goal not found" }, { status: 404 });
        }

        // Upsert equivalent for goal logs in Prisma SQLite
        const existingLog = await prisma.goalLog.findFirst({
            where: {
                goalId: existingGoal.id,
                date: {
                    gte: dayjs(date).startOf("day").toDate(),
                    lte: dayjs(date).endOf("day").toDate(),
                },
            },
        });

        let log;

        if (existingLog) {
            log = await prisma.goalLog.update({
                where: { id: existingLog.id },
                data: { completedSteps },
            });
        } else {
            log = await prisma.goalLog.create({
                data: {
                    goalId: existingGoal.id,
                    date,
                    completedSteps,
                },
            });
        }

        return NextResponse.json(log, { status: 200 });
    } catch (error) {
        console.error("Log Step Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
