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

interface Session {
    user: { name: string; email: string; imageUrl: string; id: string };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
    const session = await getServerSession(authOptions) as Session;
    const user = session?.user
    const categories = await prismadb.category.findMany();
    if (!user) {

        const companions = await prismadb.companion.findMany({
            where: {
                userId: "clopu6fxi0000ltrjo4zol15b",
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
        return (<div className="h-full p-4 space-y-2">
            {JSON.stringify(session?.user)}
            <SearchInput />
            <Categories categories={categories} />
            <Companions companions={companions} />
        </div>)
    }
    const companions = await prismadb.companion.findMany({
        where: {
            OR: [
                { userId: user.id },
                { userId: 'clopu6fxi0000ltrjo4zol15b' } // Replace with the specific user ID condition
            ],
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