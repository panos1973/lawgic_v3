"use client";
import { NextPage } from "next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUser } from "@clerk/nextjs";

interface Props {}

const UserProfileDropdown: NextPage<Props> = () => {
  const { user } = useUser();
  const auth = useAuth();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-10 w-10 m-auto border-2 hover:cursor-pointer">
            {user?.hasImage && <AvatarImage src={user?.imageUrl} />}
            <AvatarFallback className="bg-slate-300 w-full h-full text-slate-900 text-xs font-semibold uppercase">
              {user?.lastName?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            {user?.firstName} {user?.lastName}
            <small className="block font-light ">
              {user?.primaryEmailAddress?.emailAddress}
            </small>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Usage</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => auth.signOut()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <p className="text-xs text-center text-wrap mt-1 font-medium">
        {user?.firstName?.substring(0, 1)}.{user?.lastName}
      </p> */}
    </div>
  );
};

export default UserProfileDropdown;
