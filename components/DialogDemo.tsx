"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface TechVersion {
  name: string;
  versions: string[];
}

interface SelectedVersions {
  [tech: string]: {
    [version: string]: boolean;
  };
}

const techs: TechVersion[] = [
  {
    name: "TSG RAN",
    versions: [
      "TSG RAN Radio Access Network",
      "RAN WG1 Radio Layer 1 (Physical layer)",
      "RAN WG2 Radio layer 2 and Radio layer 3 Radio Resource Control",
      "RAN WG3 UTRAN/E-UTRAN/NG-RAN architecture and related network interfaces",
      "RAN WG4 Radio Performance and Protocol Aspects",
    ],
  },
  {
    name: "TSG SA",
    versions: [
      "TSG SA Service & System Aspects",
      "SA WG1 Services",
      "SA WG2 System Architecture and Services",
      "SA WG3 Security and Privacy",
      "SA WG4 Multimedia Codecs, Systems and Services",
    ],
  },
  {
    name: "TSG CT",
    versions: [
      "TSG CT Core Network & Terminals",
      "CT WG1 User Equipment to Core Network protocols",
      "CT WG3 Interworking with External Networks & Policy and Charging Control",
      "CT WG4 Core Network Protocols",
      "CT WG6 Smart Card Application Aspects",
    ],
  },
];

export function DialogDemo(): JSX.Element {
  const [selectedVersions, setSelectedVersions] = useState<SelectedVersions>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedVersions = localStorage.getItem('selectedVersions');
    if (savedVersions) {
      setSelectedVersions(JSON.parse(savedVersions));
    }
  }, []);

  const handleVersionToggle = (tech: string, version: string): void => {
    setSelectedVersions((prev) => ({
      ...prev,
      [tech]: {
        ...(prev[tech] || {}),
        [version]: !(prev[tech] && prev[tech][version]),
      },
    }));
  };

  const handleSaveChanges = (): void => {
    localStorage.setItem('selectedVersions', JSON.stringify(selectedVersions));
    setOpen(false);
    toast({
      title: "Changes saved",
      description: "Your version selections have been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Versions</DialogTitle>
          <DialogDescription>
            Choose the versions you want to work with.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {techs.map((tech) => (
            <div key={tech.name} className="mb-4">
              <h3 className="mb-2 font-semibold">{tech.name}</h3>
              {tech.versions.map((version) => (
                <div key={version} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${tech.name}-${version}`}
                    checked={
                      selectedVersions[tech.name] &&
                      selectedVersions[tech.name][version]
                    }
                    onCheckedChange={() =>
                      handleVersionToggle(tech.name, version)
                    }
                  />
                  <Label htmlFor={`${tech.name}-${version}`}>{version}</Label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}