import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { authOptions } from "../auth/[...nextauth]/route";

const f = createUploadthing();
interface Session {
  user: { name: string; email: string; imageUrl: string; id: string };
}
const handleAuth = async () => {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session) throw new Error("Unauthorized");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  companionImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
