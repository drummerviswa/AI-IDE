"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import LogoutButton from "./logout-button";
import { useCurrentUser } from "../hooks/use-current-user";
import Link from "next/link";

const UserButton = () => {

  const user = useCurrentUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className={cn("relative rounded-full ring-1 ring-border/60")}>
          <Avatar>
            <AvatarImage src={user?.image!} alt={user?.name!} />
            <AvatarFallback className="bg-red-500">
              <User className="text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

    <DropdownMenuContent className="mr-4">
      <DropdownMenuItem>
        <span>
          {user?.email}
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/settings" className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator/>
        <LogoutButton>
            <DropdownMenuItem>
                <LogOut className="h-4 w-4 mr-2"/>
                LogOut
            </DropdownMenuItem>
        </LogoutButton>
    </DropdownMenuContent>

    </DropdownMenu>
  );
};

export default UserButton;
