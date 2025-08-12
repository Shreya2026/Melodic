import { axiosInstance } from "@/lib/axios";

import { create } from "zustand";
import { io } from "socket.io-client";
import type { Message, User } from "@/types";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;
	// Add a map to store messages for each conversation
	conversationMessages: Map<string, Message[]>;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	clearConversationCache: () => void;
	refreshMessages: (userId: string) => Promise<void>;
}

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : import.meta.env.VITE_API_URL;


const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
	withCredentials: true,
	 transports: ['websocket'],
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	selectedUser: null,
	conversationMessages: new Map(),

	setSelectedUser: (user) => {
		const currentState = get();
		
		// If selecting the same user, don't do anything
		if (currentState.selectedUser?.clerkId === user?.clerkId) {
			return;
		}
		
		// Save current messages to conversation map before switching
		if (currentState.selectedUser && currentState.messages.length > 0) {
			const conversationKey = currentState.selectedUser.clerkId;
			const updatedConversations = new Map(currentState.conversationMessages);
			updatedConversations.set(conversationKey, [...currentState.messages]);
			set({ conversationMessages: updatedConversations });
		}
		
		// Load messages for the new selected user
		const newMessages = user ? currentState.conversationMessages.get(user.clerkId) || [] : [];
		
		set({ 
			selectedUser: user, 
			messages: newMessages 
		});
	},

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/api/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			socket.on("receive_message", (message: Message) => {
				const { selectedUser, conversationMessages } = get();
				
				// Determine which conversation this message belongs to
				let conversationUserId: string;
				if (message.senderId === userId) {
					conversationUserId = message.receiverId;
				} else {
					conversationUserId = message.senderId;
				}
				
				// Update conversation messages map
				const updatedConversations = new Map(conversationMessages);
				const existingMessages = updatedConversations.get(conversationUserId) || [];
				
				// Check if message already exists to prevent duplicates
				const messageExists = existingMessages.some(msg => msg._id === message._id);
				if (!messageExists) {
					updatedConversations.set(conversationUserId, [...existingMessages, message]);
					
					// If this message is for the currently selected conversation, also update current messages
					if (selectedUser?.clerkId === conversationUserId) {
						set((state) => {
							const currentMessageExists = state.messages.some(msg => msg._id === message._id);
							if (!currentMessageExists) {
								return {
									messages: [...state.messages, message],
									conversationMessages: updatedConversations,
								};
							}
							return { conversationMessages: updatedConversations };
						});
					} else {
						set({ conversationMessages: updatedConversations });
					}
				}
			});

			socket.on("message_sent", (message: Message) => {
				const { selectedUser, conversationMessages } = get();
				
				// Determine which conversation this message belongs to
				let conversationUserId: string;
				if (message.senderId === userId) {
					conversationUserId = message.receiverId;
				} else {
					conversationUserId = message.senderId;
				}
				
				// Update conversation messages map
				const updatedConversations = new Map(conversationMessages);
				const existingMessages = updatedConversations.get(conversationUserId) || [];
				
				// Check if message already exists to prevent duplicates
				const messageExists = existingMessages.some(msg => msg._id === message._id);
				if (!messageExists) {
					updatedConversations.set(conversationUserId, [...existingMessages, message]);
					
					// If this message is for the currently selected conversation, also update current messages
					if (selectedUser?.clerkId === conversationUserId) {
						set((state) => {
							const currentMessageExists = state.messages.some(msg => msg._id === message._id);
							if (!currentMessageExists) {
								return {
									messages: [...state.messages, message],
									conversationMessages: updatedConversations,
								};
							}
							return { conversationMessages: updatedConversations };
						});
					} else {
						set({ conversationMessages: updatedConversations });
					}
				}
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;

		socket.emit("send_message", { receiverId, senderId, content });
	},

	fetchMessages: async (userId: string) => {
		const { conversationMessages, selectedUser } = get();
		
		// Check if we already have messages for this conversation
		const existingMessages = conversationMessages.get(userId);
		if (existingMessages && existingMessages.length > 0) {
			// If we have cached messages and this user is selected, show them immediately
			if (selectedUser?.clerkId === userId) {
				set({ messages: existingMessages });
			}
			return; // Don't fetch from server if we have cached messages
		}
		
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			console.log("Fetched messages for user:", userId, response.data);
			
			const fetchedMessages = response.data || [];
			
			// Update conversation messages map
			const updatedConversations = new Map(conversationMessages);
			updatedConversations.set(userId, fetchedMessages);
			
			// If this user is currently selected, also update current messages
			if (selectedUser?.clerkId === userId) {
				set({ 
					messages: fetchedMessages,
					conversationMessages: updatedConversations
				});
			} else {
				set({ conversationMessages: updatedConversations });
			}
		} catch (error: any) {
			console.error("Error fetching messages:", error);
			set({ error: error.response?.data?.message || "Failed to fetch messages" });
		} finally {
			set({ isLoading: false });
		}
	},

	clearConversationCache: () => {
		set({ 
			conversationMessages: new Map(),
			messages: [],
			selectedUser: null
		});
	},

	refreshMessages: async (userId: string) => {
		const { conversationMessages } = get();
		
		// Clear cached messages for this user
		const updatedConversations = new Map(conversationMessages);
		updatedConversations.delete(userId);
		set({ conversationMessages: updatedConversations });
		
		// Fetch fresh messages
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			console.log("Refreshed messages for user:", userId, response.data);
			
			const fetchedMessages = response.data || [];
			
			// Update conversation messages map
			updatedConversations.set(userId, fetchedMessages);
			
			const { selectedUser } = get();
			// If this user is currently selected, also update current messages
			if (selectedUser?.clerkId === userId) {
				set({ 
					messages: fetchedMessages,
					conversationMessages: updatedConversations
				});
			} else {
				set({ conversationMessages: updatedConversations });
			}
		} catch (error: any) {
			console.error("Error refreshing messages:", error);
			set({ error: error.response?.data?.message || "Failed to refresh messages" });
		} finally {
			set({ isLoading: false });
		}
	},
}));