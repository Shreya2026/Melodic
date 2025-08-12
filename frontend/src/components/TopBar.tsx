import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const Topbar = () => {  
	const {isAdmin}  = useAuthStore();
	console.log("isAdmin", isAdmin);


	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/logo.png' className='size-8 md:size-10' alt='Melodic logo' /> 
				<span className='hidden sm:inline'>Melodic</span>
			</div>
			<div className='flex items-center gap-2 md:gap-4'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
						<LayoutDashboardIcon className='size-4 mr-0 md:mr-2' />
						<span className='hidden md:inline'>Admin Dashboard</span>
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;