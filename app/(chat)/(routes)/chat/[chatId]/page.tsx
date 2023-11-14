import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import ChatClient from "@/components/ChatClient";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

interface Session {
    user: { name: string; email: string; imageUrl: string; id: string };
}

interface ChatIdPageProps {
    params: {
        chatId: string;
    }
}

const ChatIdPae = async ({ params }: ChatIdPageProps) => {
    const session = await getServerSession(authOptions) as Session;

    if (!session) redirect('/sign-in');

    const userId = session.user.id
    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.chatId,
            userId: session.user.id
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc"
                },
                where: {
                    userId,
                }
            },
            _count: {
                select: {
                    messages: true,
                }
            }
        }
    });

    if (!companion) redirect("/");

    return (
        <ChatClient companion={companion} />
    )
}

export default ChatIdPae