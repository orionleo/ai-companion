import { Avatar, AvatarImage } from "./ui/avatar";

interface BotAvarprops {
    src: string;
}

const BotAvatar = ({ src }: BotAvarprops) => {
    return (
        <Avatar className="h-12 w-12">
            <AvatarImage src={src} />
        </Avatar>
    )
}

export default BotAvatar