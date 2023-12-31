import dotenv from "dotenv";
import { StreamingTextResponse, LangChainStream, OpenAIStream } from "ai";

import { Replicate } from "langchain/llms/replicate";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { TextEncoder } from "util";

dotenv.config({ path: `.env` });
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY!,
// });
// const openai = new OpenAI();

interface Session {
  user: { name: string; email: string; imageUrl: string; id: string };
}

// function convertToChatMessages(data: string) {
//   const messages: any[] = [];
//   console.log(data);

//   const prompts = data.split("\n\n");

//   prompts.forEach((prompt) => {
//     const parts = prompt.split("\n");
//     const role = parts[0].trim();

//     // Assuming that each role line starts with 'Human:', 'User:', or 'Elon:'
//     if (role.startsWith("Human:") || role.startsWith("User:")) {
//       messages.push({
//         role: "user",
//         content: parts.slice(1).join("\n").trim(),
//       });
//     } else {
//       messages.push({
//         role: "assistant",
//         content: parts.slice(1).join("\n").trim(),
//       });
//     }
//   });

//   return messages;
// }

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    console.log("PROMPT", prompt);

    const session = (await getServerSession(authOptions)) as Session;
    const user = session.user;
    if (!user || !user.name || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
      companionName: name!,
      userId: user.id,
      modelName: "llama2-13b",
    };
    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }
    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    // Query Pinecone

    const recentChatHistory = await memoryManager.readLatestHistory(
      companionKey
    );

    // Right now the preamble is included in the similarity search, but that
    // shouldn't be an issue

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }
    const { handlers } = LangChainStream();
    // Call Replicate for inference
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    // Turn verbose on for debugging
    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix.

        ${companion.instructions}

        Below are relevant details about ${companion.name}'s past and the conversation you are in.
        ${relevantHistory}

        ${recentChatHistory}\n${companion.name}:`
        )
        .catch(console.error)
    );

    // `ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix.

    // ${companion.instructions}

    // Below are relevant details about ${companion.name}'s past and the conversation you are in.
    // ${relevantHistory}

    // ${recentChatHistory}\n${companion.name}:`

    // const messages = convertToChatMessages(`${recentChatHistory}\n${companion.name}:`);
    // const lines = `${recentChatHistory}\n${companion.name}:`.split("\n");
    // const messages: any[] = lines.map((line) => {
    //   const role =
    //     line.startsWith("Human") || line.startsWith("User")
    //       ? "user"
    //       : "assistant";
    //   const content = line.replace(/^(Human:|User:|Elon:)\s*/, "");
    //   return { role, content };
    // });

    // console.log("MESSAGES", messages);
    // openai.apiKey = process.env.OPENAI_API_KEY!;

    // const completion = await openai.chat.completions.create({
    //   messages,
    //   model: "gpt-3.5-turbo-1106",
    // });

    // // console.log(messages);

    // // const stream = OpenAIStream(res);
    // return NextResponse.json(completion.choices[0].message);
    // console.log("STREAMING TEXT RESPONSE", streamTextResponse);

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0].replace(/^"|"$/g, "");
    console.log("RESPONSE", response);

    await memoryManager.writeToHistory("" + response.trim(), companionKey);
    var Readable = require("stream").Readable;

    // var s = new Readable();
    // s.push(response);
    // s.push(null);
    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    const e = error as unknown as any;
    console.log("ERROR", e.message);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
