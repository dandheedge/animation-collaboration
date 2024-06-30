import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/lib/firebase";

interface User {
  [key: string]: unknown; // This allows for additional properties
}

interface UserStore {
  currentUser: User | null;
  isLoading: boolean;
  fetchUserInfo: (uid: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid: string) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data() as User, isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error(err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
