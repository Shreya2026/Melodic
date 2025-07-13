import { axiosInstance } from '@/lib/axios';
import {create} from 'zustand';

interface AuthStore{
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;

    checkAdminStatus: () => Promise<void>;
    reset:() => void;
}


export const useAuthStore = create<AuthStore>((set) => ({
    isAdmin: false,
    isLoading: false,
    error: null,
    checkAdminStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log("Checking admin status...");
            const response = await axiosInstance.get('/admin/check');
            console.log("Admin check response:", response.data);
            set({ isAdmin: response.data.admin});
        } catch (error) {
            console.log("Admin check error:", error);
            let errorMessage = 'An unknown error occurred';
            if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object' && (error as any).response !== null && 'data' in (error as any).response && typeof (error as any).response.data === 'object' && (error as any).response.data !== null && 'message' in (error as any).response.data) {
                errorMessage = (error as any).response.data.message;
            }
            set({ isAdmin: false, error: errorMessage });
        }finally{
            set({ isLoading: false });
        }
    },  
    reset: () => set({ isAdmin: false, isLoading: false, error: null }),
}));