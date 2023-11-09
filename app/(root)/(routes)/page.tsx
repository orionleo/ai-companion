import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";


interface RootPageProps {
    searchParams: {
        categoryId: string;
        name: string;
    };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
    const data = false;
    const session = await getServerSession(authOptions);

    return (
        <div className="h-full p-4 space-y-2">
            {JSON.stringify(session?.user)}
        </div>
    )
}

export default RootPage;