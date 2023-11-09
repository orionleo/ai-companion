"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { AiOutlineUser } from "react-icons/ai";

 const UserAvatar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {user?.image ? (
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.image} />
        </Avatar>
      ) : (
        <Avatar className="h-12 w-12">
          <AiOutlineUser className ="h-12 w-12" />
        </Avatar>
      )}
    </>
  );
};
export default UserAvatar
