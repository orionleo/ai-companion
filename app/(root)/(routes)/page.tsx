import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Categories from "@/components/Categories";
import Companions from "@/components/Companions";
import SearchInput from "@/components/SearchInput";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";


interface RootPageProps {
    searchParams: {
        categoryId: string;
        name: string;
    };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
    const companions = await prismadb.companion.findMany({
        where: {
            categories: {
                some: {
                    id: searchParams.categoryId
                }
            },
            name: {
                search: searchParams.name
            }
        },
        orderBy: {
            createdAt: "desc"
        }, include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })
    const categories = await prismadb.category.findMany();
    const session = await getServerSession(authOptions);

    return (
        <div className="h-full p-4 space-y-2">
            {JSON.stringify(session?.user)}
            <SearchInput />
            <Categories categories={categories} />
            <Companions companions={companions} />
        </div>
    )
}

export default RootPage;