//components/Sidebar.tsx

"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchChats, fetchMessages } from "@/app/actions/chat";
import {
  FileDown,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  LogOut,
} from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IMessage } from "@/models";

type Chat = {
  _id: string;
  title: string;
  createdAt: string;
};

export function Sidebar() {
  const { data: session } = useSession();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const loadMoreChats = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const newChats = await fetchChats(chats.length);
    const parsedChats = JSON.parse(newChats);
    setChats((prevChats) => {
      const uniqueChats = parsedChats.filter(
        (chat: Chat) => !prevChats.some((prevChat) => prevChat._id === chat._id)
      );
      return [...prevChats, ...uniqueChats];
    });
    setHasMore(parsedChats.length === 20);
    setLoading(false);
    setLoadingMore(false);
  }, [chats.length, hasMore, loadingMore]);

  const handleLogout = () => {
    signOut();
    router.push("/home");
  };
  useEffect(() => {
    loadMoreChats();
  }, [loadMoreChats]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMoreChats();
    }
  }, [inView, hasMore, loadingMore, loadMoreChats]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX <= 20) {
        setIsVisible(true);
      } else if (event.clientX > 250) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  const exportChatToCSV = async (chatId: string) => {
    const messages = await fetchMessages(chatId);
    downloadMessagesCSV(JSON.parse(messages));
    // Implement the export to CSV functionality here
    console.log(`Exporting chat ${chatId} to CSV`);
  };
  const groupChatsByDate = (chats: Chat[]): Map<string, Chat[]> => {
    const groups = new Map<string, Chat[]>();

    chats.forEach((chat) => {
      const date = new Date(chat.createdAt);
      const key = getDateKey(date);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(chat);
    });

    return groups;
  };

  const getDateKey = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, "MMMM yyyy");
  };

  const groupedChats = groupChatsByDate(chats);

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };
  interface ImageMetadata {
    description: string;
    title: string;
    id: string;
    image_path: string;
  }

  interface Message {
    content: string;
    role: string;
    chatId: string;
    createdAt: Date;
    imageData: ImageMetadata[];
    Documents: string[];
  }
  // utils/downloadMessagesCSV.ts

  // import { IMessage } from '../types/message'; // Adjust the import path as needed

  // utils/downloadMessagesCSV.ts

  // import { IMessage } from '../types/message'; // Adjust the import path as needed

  function downloadMessagesCSV(messages: IMessage[]): void {
    // Convert messages to CSV
    const headers = [
      "Content",
      "Role",
      "ChatId",
      "CreatedAt",
      "ImageData",
      "Documents",
    ];
    const rows = messages.map((message) => [
      message.content,
      message.role,
      message.chatId.toString(),
      formatDate(message.createdAt), // Use a helper function to format the date
      JSON.stringify(message.imageData),
      message.Documents.join(";"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "messages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Helper function to format the date
  function formatDate(date: Date | string | number): string {
    if (date instanceof Date) {
      return date.toISOString();
    } else if (typeof date === "string") {
      // If it's a string, try parsing it
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? date : parsedDate.toISOString();
    } else if (typeof date === "number") {
      // If it's a timestamp number
      return new Date(date).toISOString();
    }
    return String(date); // Fallback to string representation
  }

  if (!session) {
    return null;
  }
  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
      <div className="p-4">
        <h1 className="text-4xl font-bold mb-8 flex items-center text-white">
          <span className="mr-2">🤖</span> ChatBot
        </h1>
        <Button
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
          onClick={() => router.push("/")}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4">
        {Array.from(groupedChats).map(([date, chatsInGroup]) => (
          <div key={date} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{date}</h3>
            {chatsInGroup.map((chat) => (
              <div key={chat._id} className="mb-2">
                <Link href={`/chat/${chat._id}`}>
                  <div
                    className={cn(
                      "flex items-center cursor-pointer bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg",
                      pathname === `/chat/${chat._id}` &&
                        "bg-purple-600 ring-2 ring-purple-400"
                    )}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                    <p className="truncate">{truncateTitle(chat.title, 25)}</p>
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 ml-auto"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            exportChatToCSV(chat._id);
                            setIsPopoverOpen(false); // Close the popover after clicking
                          }}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Export to CSV
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))}
        {loading && (
          <Skeleton className="h-[20px] w-[100px] rounded-full mx-4" />
        )}
        {loadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <div ref={ref}></div>
      </ScrollArea>
      <div className="p-4">
        <Button
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}
