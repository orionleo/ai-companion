"use client";

import { useCompletion } from "ai/react";
import { FormEvent, useState } from "react";
import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import ChatHeader from "./ChatHeader";
import { ChatMessageProps } from "./ChatMessage";
import ChatMessages from "./ChatMessages";
import ChatForm from "./ChatForm";


interface ChatClientProps {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number;
        }
    },
    messageCount:Number,
};

const ChatClient = ({
    companion,messageCount
}: ChatClientProps) => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);

    const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
        api: `/api/chat/${companion.id}`,
        onFinish(_prompt, completion) {
            const systemMessages: ChatMessageProps = {
                role: "system",
                content: completion.replace(/^"|"$/g, "")
            };
            console.log(systemMessages);

            setMessages((current) => [...current, systemMessages]);
            setInput("");

            router.refresh();
        },
        onError(error) {
            console.log(error);
        }
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input
        };

        setMessages((current) => [...current, userMessage]);

        handleSubmit(e);
    }

    return (
        <div className="flex flex-col h-full p-4 space-y-2">
            <ChatHeader companion={companion} messageCount={messageCount} />
            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages}
            />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit}
            />
        </div>
    )
}

export default ChatClient