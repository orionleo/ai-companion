import { redirect } from "next/navigation";


import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CompanionForm from "@/components/CompanionForm";

interface CompanionIdPageProps {
    params: {
        companionId: string;
    };
};
interface Session {
    user: { name: string; email: string; imageUrl: string; id: string };
}

const CompanionIdPage = async ({
    params
}: CompanionIdPageProps) => {
    const session = await getServerSession(authOptions) as Session;

    if (!session) {
        return redirect('/sign-in');
    }

    const validSubscription = await checkSubscription();

    // if (!validSubscription) {
    //     return redirect("/");
    // }

    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.companionId,
            userId: session.user.id,
        }
    });

    const categories = await prismadb.category.findMany();

    return (
        <CompanionForm initialData={companion} categories={categories} />
    );
}

export default CompanionIdPage;
