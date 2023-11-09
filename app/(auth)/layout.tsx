import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const AuthLayout = async({
    children
  }: {
    children: React.ReactNode;
  }) => {
    const session = await getServerSession(authOptions);
    if(session){
      redirect("/");
    }
    return ( 
      <div className="flex justify-center items-center h-full">
        {children}
      </div>
     );
  }
   
  export default AuthLayout;