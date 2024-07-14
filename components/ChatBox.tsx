//chatbox.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { User, Bot, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { fetchMessages, savemessage, sendMessage } from "@/app/actions/chat";

import ImageDialog from "./ImageDialog";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

import Spinner from "./ZoomingDot";
interface ImageData {
  metadata: {
    description: string;
    title: string;
    id: string;
    image_path: string;
  };
}
type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  imageData?: ImageData[];
  Documents?: string[];
};

const formatContent = (content: string) => {
  const lines = content.split("\n");
  return lines.map((line, index) => {
    if (line.match(/^\d+\./)) {
      return (
        <li key={index} className="ml-6 list-decimal">
          {line.replace(/^\d+\./, "").trim()}
        </li>
      );
    } else if (line.trim().startsWith("-")) {
      return (
        <li key={index} className="ml-6 list-disc">
          {line.replace(/^-/, "").trim()}
        </li>
      );
    }
    return <p key={index}>{line}</p>;
  });
};

export function ChatBox({ chatId }: { chatId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (chatId) {
      startTransition(async () => {
        const fetchedMessages = await fetchMessages(chatId);

        setMessages(JSON.parse(fetchedMessages));
      });
    }
  }, [chatId]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const updateChatHistory = (content: string) => {
    setMessages((prev) => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1].role === "assistant") {
        newHistory[newHistory.length - 1].content = content;
      } else {
        newHistory.push({
          id: Date.now().toString(),
          role: "assistant",
          content,
         
        });
      }
      return newHistory;
    });
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/query1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: input,
            chat_history: messages.map((msg) => `${msg.role}:${msg.content}`),
            // chat_history: messages
            // .filter(msg => msg.role === "assistant")
            // .map(msg => msg.content),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        let assistantResponse = "";
       
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // console.log(value);

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (typeof data.token === "string") {
                assistantResponse += data.token;
                updateChatHistory(assistantResponse);
              } else if (data.data) {
                console.log(data.data);
                const temp = JSON.parse(data.data);
               
                setMessages((prev) => {
                  const newmessages = prev.map((msg) => {
                    if (
                      msg.content === assistantResponse &&
                      msg.role === "assistant"
                    ) {
                      msg.content = assistantResponse;
                      msg.imageData = temp.imageData;
                      msg.Documents = temp.documents;
                      return msg;
                    }
                    return msg;
                  });
                  return newmessages;
                });

                await sendMessage({
                  content: assistantResponse as string,
                  chatId: chatId,
                  query: input,
                  Documents: JSON.stringify(temp.documents) as string,

                  imageData: JSON.stringify(temp.imageData) as string,
                })
                  .then((response) => {
                    console.log("Message saved:", response);
                  })
                  .catch((err) => {
                    console.log(err);
                  });

              }
             
            }
          }
        }
      } catch (error) {
        console.error("Error calling chat API:", error);
      } finally {
        setInput("");
        setIsTyping(false);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b pt-12 pl-3 pr-3bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ">
       
      <div className="flex-1 overflow-y-auto  space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start space-x-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
            )}
            <div
              className={`p-4 rounded-lg max-w-[70%] relative group ${
                message.role === "user" ? "bg-blue-500" : "bg-purple-600"
              }`}
            >
              <div className="prose max-w-none">
                {formatContent(message.content)}
                {message.role === "assistant" && isTyping && <Spinner />}
                {message.role === "assistant" && message.imageData && (
                  <ImageDialog
                    content={message.content}
                    imageData={message.imageData}
                  />
                )}
              </div>
              <button
                onClick={() => copyToClipboard(message.content, message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedId === message.content ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
            )}
          </motion.div>
        ))}
     {isLoading && (
          <div className="text-center py-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-6 h-6 border-t-2 border-blue-500 rounded-full"
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-3 border-t border-purple-700">
          <div className="flex items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-transparent text-white px-6 py-4 focus:outline-none placeholder-purple-300 resize-none"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '200px' }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full transition duration-300 mr-1 ${
                !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}