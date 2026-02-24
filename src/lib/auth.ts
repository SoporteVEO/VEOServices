import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Map better-auth's "name" to Prisma's firstName/lastName (schema has no "name" column)
          const u = user as Record<string, unknown>;
          const nameStr = typeof user.name === "string" ? user.name.trim() : "";
          const firstName =
            (u.firstName as string) ??
            (nameStr ? (nameStr.split(/\s+/)[0] ?? "") : "");
          const lastName =
            (u.lastName as string) ??
            (nameStr ? nameStr.split(/\s+/).slice(1).join(" ") || null : null);
          delete u.name;
          u.firstName = firstName;
          u.lastName = lastName;
          return { data: user };
        },
      },
    },
  },
});
