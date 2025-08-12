
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Topbar from "@/components/TopBar";
import UsersList from "./components/UsersLists";
import ChatHeader from "./components/ChatHeader";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages, isLoading } = useChatStore();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	useEffect(() => {
		if (selectedUser && user?.id) {
			console.log("=== FETCHING MESSAGES ===");
			console.log("Current user ID:", user?.id);
			console.log("Selected user ID:", selectedUser.clerkId);
			console.log("Fetching messages for selectedUser:", selectedUser.clerkId);
			fetchMessages(selectedUser.clerkId);
		}
	}, [selectedUser, fetchMessages, user?.id]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	console.log("=== CHAT PAGE DEBUG ===");
	console.log("ChatPage - Current user:", user?.id);
	console.log("ChatPage - Selected user:", selectedUser?.clerkId);
	console.log("ChatPage - Messages count:", messages.length);
	console.log("ChatPage - Messages:", messages.map(m => ({
		id: m._id,
		content: m.content,
		senderId: m.senderId,
		receiverId: m.receiverId,
		createdAt: m.createdAt
	})));

	return (
		<main className='h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden'>
			<Topbar />

			<div className='grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] lg:grid-cols-[300px_1fr] h-[calc(100vh-200px)]'>
				<UsersList />

				{/* chat message */}
				<div className='flex flex-col h-full'>
					{selectedUser ? (
						<>
							<ChatHeader />

							{/* Messages */}
							<ScrollArea className='flex-1 h-0'>
								<div className='p-2 sm:p-4 space-y-3 sm:space-y-4 pb-4'>
									{isLoading && messages.length === 0 ? (
										<div className='flex justify-center items-center py-8'>
											<div className='text-zinc-400 text-sm'>Loading messages...</div>
										</div>
									) : messages.length === 0 ? (
										<div className='flex justify-center items-center py-8'>
											<div className='text-zinc-400 text-sm'>No messages yet. Start the conversation!</div>
										</div>
									) : (
										messages.map((message) => (
											<div
												key={message._id}
												className={`flex items-start gap-2 sm:gap-3 ${
													message.senderId === user?.id ? "flex-row-reverse" : ""
												}`}
											>
												<Avatar className='size-6 sm:size-8 flex-shrink-0'>
													<AvatarImage
														src={
															message.senderId === user?.id
																? user.imageUrl
																: selectedUser.imageUrl
														}
													/>
												</Avatar>

												<div
													className={`rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-[70%]
														${message.senderId === user?.id ? "bg-green-500" : "bg-zinc-800"}
													`}
												>
													<p className='text-xs sm:text-sm break-words'>{message.content}</p>
													<span className='text-xs text-zinc-300 mt-1 block'>
														{formatTime(message.createdAt)}
													</span>
												</div>
											</div>
										))
									)}
									<div ref={messagesEndRef} />
								</div>
							</ScrollArea>

							<MessageInput />
						</>
					) : (
						<NoConversationPlaceholder />
					)}
				</div>
			</div>
		</main>
	);
};
export default ChatPage;

const NoConversationPlaceholder = () => (
	<div className='flex flex-col items-center justify-center h-full space-y-6'>
		<img src='/logo.png' alt='Melodic' className='size-16 animate-bounce' />
		<div className='text-center'>
			<h3 className='text-zinc-300 text-lg font-medium mb-1'>No conversation selected</h3>
			<p className='text-zinc-500 text-sm'>Choose a friend to start chatting</p>
		</div>
	</div>
);