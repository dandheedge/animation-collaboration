//

import create from "zustand";

interface AnimationState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animation: any;
  setAnimation: (animation: unknown) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  animation: null,
  setAnimation: (animation) => set({ animation }),
}));
