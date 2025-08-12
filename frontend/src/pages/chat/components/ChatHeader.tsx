import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";

const ChatHeader = () => {
	const { selectedUser, onlineUsers } = useChatStore();

	if (!selectedUser) return null;

	return (
		<div className='p-3 sm:p-4 border-b border-zinc-800 bg-zinc-900/75 backdrop-blur-sm'>
			<div className='flex items-center gap-3'>
				<Avatar className='size-8 sm:size-10'>
					<AvatarImage src={selectedUser.imageUrl} />
					<AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
				</Avatar>
				<div className='flex-1 min-w-0'>
					<h2 className='font-medium text-sm sm:text-base truncate'>{selectedUser.fullName}</h2>
					<p className='text-xs sm:text-sm text-zinc-400'>
						{onlineUsers.has(selectedUser.clerkId) ? "Online" : "Offline"}
					</p>
				</div>
			</div>
		</div>
	);
};
export default ChatHeader;