import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { useState } from "react";

const MessageInput = () => {
	const [newMessage, setNewMessage] = useState("");
	const { user } = useUser();
	const { selectedUser, sendMessage } = useChatStore();

	const handleSend = () => {
		if (!selectedUser || !user || !newMessage) return;
		sendMessage(selectedUser.clerkId, user.id, newMessage.trim());
		setNewMessage("");
	};

	return (
		<div className='p-3 sm:p-4 border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-sm chat-input-mobile mobile-safe-bottom'>
			<div className='flex gap-2 sm:gap-3 items-end'>
				<Input
					placeholder='Type a message...'
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					className='bg-zinc-800 border-zinc-700 focus:border-zinc-600 text-sm sm:text-base min-h-[44px] sm:min-h-[44px]'
					onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
				/>

				<Button 
					size="sm"
					onClick={handleSend} 
					disabled={!newMessage.trim()}
					className='bg-green-500 hover:bg-green-600 text-black shrink-0 h-[44px] w-[44px] p-0'
				>
					<Send className='size-4' />
				</Button>
			</div>
		</div>
	);
};
export default MessageInput;