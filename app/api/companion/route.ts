import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { checkSubscription } from "@/lib/subscription";
import prismadb from "@/lib/prismadb";

interface Session {
  user: { name: string; email: string; imageUrl: string; id: string };
}

export async function POST(request: Request) {
  try {
    console.log("HELLLO");
    const body = await request.json();
    const session = (await getServerSession(authOptions)) as Session;
    const user = session.user;
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!user || !user.id || !user.name) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const isPro = await checkSubscription();
    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const companion = await prismadb.companion.create({
      data: {
        categories: {
          connect: {
            id: categoryId,
          },
        },
        userId: user.id,
        userName: user.name,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
