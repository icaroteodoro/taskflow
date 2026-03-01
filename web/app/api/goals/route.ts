import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { getUserEmailFromJwtToken } from "@/lib/jwt";

// Helper to authenticate user from token
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

export async function POST(req: Request) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, type, totalSteps, targetDate, time, daysOfWeek } = body;

        if (!title || !type || totalSteps === undefined) {
            return NextResponse.json(
                { message: "Title, type, and totalSteps are required." },
                { status: 400 }
            );
        }

        const goal = await prisma.goal.create({
            data: {
                userId: user.id,
                title,
                type,
                totalSteps,
                targetDate: targetDate ? dayjs(targetDate).toDate() : null,
                time: time ? dayjs(`1970-01-01T${time}`).toDate() : null,
                daysOfWeek: {
                    create: daysOfWeek?.map((day: string) => ({ dayOfWeek: day })) || [],
                },
            },
            include: {
                daysOfWeek: true,
            },
        });

        const formattedGoal = {
            ...goal,
            targetDate: goal.targetDate ? dayjs(goal.targetDate).format("YYYY-MM-DD") : null,
            time: goal.time ? dayjs(goal.time).format("HH:mm") : null,
        };

        return NextResponse.json(formattedGoal, { status: 200 });
    } catch (error) {
        console.error("Create Goal Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("date"); // e.g. "2023-10-25"

        if (!dateQuery) {
            return NextResponse.json(
                { message: "Date parameter is required." },
                { status: 400 }
            );
        }

        const date = dayjs(dateQuery);
        const dayOfWeekString = date.format("dddd").toUpperCase();

        // In Prisma with SQLite, finding goals for a specific date/day involves fetching
        // the user's goals and filtering in memory, or using complex relational queries.
        // For simplicity and matching Java logical filtering:

        const goals = await prisma.goal.findMany({
            where: {
                userId: user.id,
            },
            include: {
                daysOfWeek: true,
                logs: {
                    where: {
                        date: {
                            gte: date.startOf("day").toDate(),
                            lte: date.endOf("day").toDate(),
                        },
                    },
                },
            },
        });

        type GoalWithRelations = typeof goals[0];

        // Filter goals based on type
        const filteredGoals = goals.filter((goal: GoalWithRelations) => {
            if (goal.type === "DAILY") {
                return goal.daysOfWeek.some((d: { dayOfWeek: string }) => d.dayOfWeek === dayOfWeekString);
            } else if (goal.type === "PUNCTUAL") {
                return goal.targetDate && dayjs(goal.targetDate).isSame(date, "day");
            }
            return false;
        });

        // Map to GoalDTO structure (flatten daysOfWeek and logs)
        const dtos = filteredGoals.map((g: GoalWithRelations) => {
            const logForDate = g.logs[0];
            return {
                id: g.id,
                title: g.title,
                type: g.type,
                totalSteps: g.totalSteps,
                targetDate: g.targetDate ? dayjs(g.targetDate).format("YYYY-MM-DD") : null,
                time: g.time ? dayjs(g.time).format("HH:mm") : null,
                daysOfWeek: g.daysOfWeek.map((d: { dayOfWeek: string }) => d.dayOfWeek),
                completedSteps: logForDate ? logForDate.completedSteps : 0,
            };
        });

        return NextResponse.json(dtos, { status: 200 });
    } catch (error) {
        console.error("Get Goals Error:", error);
        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        );
    }
}
