"use server";

import { revalidatePath } from "next/cache";

import { Chat, Message } from "@/models";
import dbConnect from "@/lib/mongodb";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function fetchChats(offset: number = 0, limit: number = 20) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await dbConnect();

  const chats = await Chat.find({ email: session.user.email })
    .lean()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .select("title createdAt");

  revalidatePath("/api/chats");
  console.log(chats);

  return JSON.stringify(chats);
}

export async function fetchMessages(chatId: string) {
  const session = await auth();

  if (!session) throw new Error("Unauthorized");

  await dbConnect();

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();

  return JSON.stringify(messages);
}

type IfMessage = {
  chatId: string | undefined;
  content: string;
  query: string;
  // data: string;
  imageData?: string;
  Documents?: string;
};
export async function savemessage({ chatId, content, query }: IfMessage) {
  console.log(chatId, content, query);
  try {
    const session = await auth();

    if (!session) throw new Error("Unauthorized");

    await dbConnect();

    let chat;
    if (!chatId) {
      chat = await Chat.create({
        userId: session.user.id,
        title: content.slice(0, 50), // Use first 50 chars of message as chat title
      });
      chatId = chat.id;
    } else {
      chat = await Chat.findById(chatId);
      if (!chat) throw new Error("Chat not found");
    }
    // const procesdata = JSON.parse(data);
    const userMessage = new Message({
      chatId,
      content: query,
      role: "user",
    });
    const aiMessage = new Message({
      chatId,
      content: `${content}`,
      role: "assistant",
      // Documents:procesdata.Documents,
      // imageData:procesdata.imageData
    });
    // revalidatePath(`/chat/${chatId}`);
    await userMessage.save(), await aiMessage.save();
    // Save both messages simultaneously

    return "this is messsage from save message";
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    // console.log(error.message);
  }
}
export async function sendMessage({
  chatId,
  content,
  query,
  Documents,
  imageData,
}: IfMessage) {
  const session = await auth();

  if (!session) throw new Error("Unauthorized");

  await dbConnect();

  let chat;
  let check = false;
  if (!chatId) {
    check = true;
    chat = await Chat.create({
      email: session.user.email,
      title: content.slice(0, 50), // Use first 50 chars of message as chat title
    });
    chatId = chat.id;
  } else {
    chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");
  }

  const userMessage = await Message.create({
    chatId,
    content: query,
    role: "user",
  });

  // Here you would typically call your AI service to get a response
  // For this example, we'll just echo the user's message
  // const procesdata = JSON.parse(data);
  console.log(Documents, imageData);

  const aiMessage = await Message.create({
    chatId,
    content: ` ${content}`,
    role: "assistant",
    Documents: JSON.parse(Documents!),

    imageData: JSON.parse(imageData!),
  });

  revalidatePath(`/chat/${chatId}`);
  if (check) {
    redirect(`/chat/${chatId}`);
  }
  return { userMessage, aiMessage };
}
