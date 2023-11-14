import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

interface Session {
  user: { name: string; email: string; imageUrl: string; id: string };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session;
    
  } catch (error) {}
}
