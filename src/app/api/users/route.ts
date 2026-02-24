import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// GET /api/users - Fetch all users with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          publicId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          image: true,
        },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      data: users,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, password, role } = body;

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use BetterAuth to create user
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: `${firstName} ${lastName || ""}`.trim(),
        firstName,
        lastName: lastName || undefined,
      },
      headers: await headers(),
    });

    // Check if the response is successful
    if (!result || !result.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    // Update user with additional fields if needed
    if (role && result.user) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: role as "ADMIN" | "USER" },
      });
    }

    // Revalidate the users page to reflect changes
    revalidatePath("/dashboard/users");

    return NextResponse.json(
      { message: "User created successfully", user: result.user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
