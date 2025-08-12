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
	initializeMessages: () => Promise<void>;
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
		
		// Set the new selected user and clear current messages (will be loaded by fetchMessages)
		set({ 
			selectedUser: user, 
			messages: [],
			isLoading: user ? true : false // Show loading when selecting a user
		});
		
		// fetchMessages will be called by the useEffect in ChatPage
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
				console.log("Received message via socket:", message);
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
					const newMessages = [...existingMessages, message];
					updatedConversations.set(conversationUserId, newMessages);
					
					// Save to localStorage as backup
					const storageKey = `chat_messages_${conversationUserId}`;
					localStorage.setItem(storageKey, JSON.stringify(newMessages));
					
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
				console.log("Message sent confirmation via socket:", message);
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
					const newMessages = [...existingMessages, message];
					updatedConversations.set(conversationUserId, newMessages);
					
					// Save to localStorage as backup
					const storageKey = `chat_messages_${conversationUserId}`;
					localStorage.setItem(storageKey, JSON.stringify(newMessages));
					
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
		
		// First, try to load from localStorage while we fetch from server
		const storageKey = `chat_messages_${userId}`;
		const cachedMessages = localStorage.getItem(storageKey);
		if (cachedMessages) {
			try {
				const parsedMessages = JSON.parse(cachedMessages);
				console.log("🔄 Loading cached messages for user:", userId);
				
				// Update conversation messages map with cached data
				const updatedConversations = new Map(conversationMessages);
				updatedConversations.set(userId, parsedMessages);
				
				// If this user is currently selected, show cached messages immediately
				if (selectedUser?.clerkId === userId) {
					set({ 
						messages: parsedMessages,
						conversationMessages: updatedConversations
					});
				}
			} catch (e) {
				console.error("Failed to parse cached messages:", e);
			}
		}
		
		// Always fetch from server to ensure we have the latest messages
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			console.log("📥 Fetched fresh messages for user:", userId, response.data);
			
			const fetchedMessages = response.data || [];
			
			// Update localStorage with fresh data
			localStorage.setItem(storageKey, JSON.stringify(fetchedMessages));
			
			// Update conversation messages map with fresh data
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
			console.error("❌ Error fetching messages:", error);
			// If server fetch fails but we have cached data, keep using that
			if (!cachedMessages) {
				set({ error: error.response?.data?.message || "Failed to fetch messages" });
			}
		} finally {
			set({ isLoading: false });
		}
	},

	clearConversationCache: () => {
		console.log("🧹 Clearing conversation cache");
		set({ 
			conversationMessages: new Map(),
			messages: [],
			selectedUser: null
		});
		
		// Also clear localStorage
		Object.keys(localStorage).forEach(key => {
			if (key.startsWith('chat_messages_')) {
				localStorage.removeItem(key);
			}
		});
	},

	// Add a function to handle app initialization/refresh
	initializeMessages: async () => {
		console.log("🔄 Initializing chat store on app start");
		
		// Clear any cached data on app start to ensure fresh data
		set({ 
			conversationMessages: new Map(),
			messages: [],
		});
		
		// Note: We don't restore from localStorage here because we want to
		// always fetch fresh data from the server when a conversation is opened
		// localStorage is only used as a fallback during fetch operations
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