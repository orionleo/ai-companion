"use client";

import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

interface SubscriptionButtonProps {
    isPro: boolean;
}

const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe");

            window.location.href = response.data.url;
        } catch (error) {
            toast({
                description: "Something went wrong",
                variant: "destructive"
            });
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <Button size={"sm"} variant={isPro ? "default" : "premium"} disabled={loading} onClick={onClick}>
            {isPro ? "Manage Subscription" : "Upgrade"}
            {!isPro && <Sparkles className="w-4 h-4 ml-2 fill-white" />}
        </Button>
    )
}

export default SubscriptionButton