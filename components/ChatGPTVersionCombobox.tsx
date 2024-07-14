"use client"

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button"; // Adjust import paths as needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust import paths

const chatgptVersions = [
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5",
  },
  {
    value: "gpt-4",
    label: "GPT-4",
  },
];

export function ChatgptVersionSelector() {
  const [selectedVersion, setSelectedVersion] = React.useState("gpt-3.5-turbo");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[150px] justify-between" // Added width for better display
        >
          {
            chatgptVersions.find(
              (version) => version.value === selectedVersion
            )?.label || "GPT-3.5"
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[150px]">
        <DropdownMenuGroup>
          {chatgptVersions.map((version) => (
            <DropdownMenuItem
              key={version.value}
              onClick={() => setSelectedVersion(version.value)}
            >
              {version.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}