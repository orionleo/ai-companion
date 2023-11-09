import { IconType } from "react-icons";

interface AuthSocialButtonProps {
  icon: IconType;
  onClick: () => void;
}

const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        items-center
        h-[80px]
        w-[80px]
        justify-center 
        rounded-full 
        bg-white 
        px-4 
        py-2 
        text-gray-500 
        shadow-sm 
        ring-1 
        ring-inset 
        ring-gray-300 
        hover:bg-gray-50 
        focus:outline-offset-0
      "
    >
      <Icon className="h-full w-full" />
    </button>
  );
};

export default AuthSocialButton;
