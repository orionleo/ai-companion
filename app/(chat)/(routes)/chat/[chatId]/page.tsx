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
            OR: [
                { userId: userId },
                { userId: 'clopu6fxi0000ltrjo4zol15b' } // Replace with the specific user ID condition
            ],
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

    const messages = await prismadb.message.findMany({
        where: {
            companionId: companion.id,
            userId: userId,
        }
    });
    const messageCount = messages.length || 0;
    return (
        <ChatClient companion={companion} messageCount={messageCount} />
    )
}

export default ChatIdPae