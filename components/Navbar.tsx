"use client";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import MobileSidebar from "./MobileSidebar";
import ModeToggle from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "./UserAvatar";

const font = Poppins({ weight: "600", subsets: ["latin"] });

interface NavbarProps {
  isPro: boolean;
}

const Navbar = ({ isPro }: NavbarProps) => {
  const proModal = useProModal();
  const session = useSession();
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (session?.status === "authenticated") ?
      setLoggedIn(true) :
      setLoggedIn(false)
  }, [session?.status]);

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 h-16 border-b border-primary/10 bg-secondary">
      <div className="flex items-center">
        <MobileSidebar isPro={isPro} />
        <Link href={"/"}>
          <h1 className={cn("hidden md:block text-xl md:text-3xl font-bold text-primary", font.className)}>
            companion.ai
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        {!isPro && (
          <Button onClick={proModal.onOpen} size="sm" variant="premium">
            Upgrade
            <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
          </Button>
        )}
        <ModeToggle />
        {!loggedIn ? (
          <Button variant={"premium"} onClick={() => router.push('/sign-in',)}>
            Sign In
          </Button>
        ) : (
          <>
            <UserAvatar />
            <Button variant={"destructive"} onClick={() => signOut()}>
              Sign Out
            </Button>
          </>
        )}

      </div>
    </div>
  )
}

export default Navbar