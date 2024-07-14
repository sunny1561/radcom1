import React from 'react'

const Sidebar2 = () => {
  return (
    <div>Sidebar2</div>
  )
}

export default Sidebar2

// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useInView } from "react-intersection-observer";
// import { format } from "date-fns";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { fetchChats } from "@/app/actions/chat";
// import {
//   MessageSquare,
//   Plus,
//   Loader2,
//   MoreHorizontal,
//   FileDown,
// } from "lucide-react";
// import { usePathname, useRouter } from "next/navigation";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { useSession } from "next-auth/react";
// type Chat = {
//   _id: string;
//   title: string;
//   createdAt: string;
// };

// export function Sidebar() {
//   const { data: session } = useSession()
  
//   if (!session) {
//     return null
//   }
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const { ref, inView } = useInView();
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isVisible, setIsVisible] = useState(false);

//   const loadMoreChats = async () => {
//     if (loadingMore || !hasMore) return;
//     setLoadingMore(true);
//     const newChats = await fetchChats(chats.length);
//     const parsedChats = JSON.parse(newChats);
//     setChats((prevChats) => {
//       const uniqueChats = parsedChats.filter(
//         (chat: Chat) => !prevChats.some((prevChat) => prevChat._id === chat._id)
//       );
//       return [...prevChats, ...uniqueChats];
//     });
//     setHasMore(parsedChats.length === 20);
//     setLoading(false);
//     setLoadingMore(false);
//   };

//   useEffect(() => {
//     loadMoreChats();
//   }, []);

//   useEffect(() => {
//     if (inView && hasMore && !loadingMore) {
//       loadMoreChats();
//     }
//   }, [inView, hasMore, loadingMore]);

//   useEffect(() => {
//     const handleMouseMove = (event: MouseEvent) => {
//       if (event.clientX <= 20) {
//         setIsVisible(true);
//       } else if (event.clientX > 250) {
//         setIsVisible(false);
//       }
//     };

//     document.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);
//   const exportChatToCSV = (chatId: string) => {
//     // Implement the export to CSV functionality here
//     console.log(`Exporting chat ${chatId} to CSV`);
//   };
//   const groupChatsByDate = (chats: Chat[]): Map<string, Chat[]> => {
//     const groups = new Map<string, Chat[]>();

//     chats.forEach((chat) => {
//       const date = new Date(chat.createdAt);
//       const key = getDateKey(date);

//       if (!groups.has(key)) {
//         groups.set(key, []);
//       }

//       groups.get(key)!.push(chat);
//     });

//     return groups;
//   };

//   const getDateKey = (date: Date) => {
//     const now = new Date();
//     const diffDays = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
//     );
//     if (diffDays === 0) return "Today";
//     if (diffDays === 1) return "Yesterday";
//     if (diffDays < 7) return `${diffDays} days ago`;
//     return format(date, "MMMM yyyy");
//   };

//   const groupedChats = groupChatsByDate(chats);

//   const truncateTitle = (title: string, maxLength: number) => {
//     return title.length > maxLength
//       ? title.substring(0, maxLength) + "..."
//       : title;
//   };

//   return (
//     <div
//       className={`fixed top-0 left-0 h-full w-64 bg-gray-50 border-r flex flex-col transition-transform duration-300 ease-in-out z-50 ${
//         isVisible ? "translate-x-0" : "-translate-x-full"
//       }`}
//     >
//       <div className="p-4">
//         <Button
//           className="w-full flex items-center justify-center"
//           onClick={() => router.push("/")}
//         >
//           <Plus className="mr-2 h-4 w-4" /> New Chat
//         </Button>
//       </div>
//       <ScrollArea className="flex-1">
//         <div className="pr-4">
//           {Array.from(groupedChats).map(([date, chatsInGroup]) => (
//             <div key={date} className="mb-4">
//               <h3 className="px-4 mb-2 text-sm font-semibold text-gray-500">
//                 {date}
//               </h3>
//               {chatsInGroup.map((chat) => (
//                 <div
//                   key={chat._id}
//                   className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100"
//                 >
//                   <Link href={`/chat/${chat._id}`}>
//                     <div
//                       className={cn(
//                         "flex items-center cursor-pointer",
//                         pathname === `/chat/${chat._id}` && "font-medium"
//                       )}
//                     >
//                       <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
//                       <p className="truncate">
//                         {truncateTitle(chat.title, 25)}
//                       </p>
//                     </div>
//                   </Link>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-40 p-0">
//                       <Button
//                         variant="ghost"
//                         className="w-full justify-start"
//                         onClick={() => exportChatToCSV(chat._id)}
//                       >
//                         <FileDown className="mr-2 h-4 w-4" />
//                         Export to CSV
//                       </Button>
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//               ))}
//             </div>
//           ))}
//           {loading && (
//             <Skeleton className="h-[20px] w-[100px] rounded-full mx-4" />
//           )}
//           {loadingMore && (
//             <div className="flex justify-center items-center py-4">
//               <Loader2 className="h-6 w-6 animate-spin" />
//             </div>
//           )}
//           <div ref={ref}></div>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }
