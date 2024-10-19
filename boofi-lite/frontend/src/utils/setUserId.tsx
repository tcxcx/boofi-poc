import { useAuthStore } from "@/store/authStore";

export const setUserIdFromData = (data: any) => {
  const { setUserId } = useAuthStore.getState();
  const userId = data.id || data.userId || null;
  setUserId(userId);
  console.log("User ID set in Zustand store:", userId);
};
