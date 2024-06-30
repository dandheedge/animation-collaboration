import { findPaths } from "@/lib/editor";
import * as R from "ramda";
import { create } from "zustand";

export interface AnimationState {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  ddd: number;
  assets: unknown[];
  fonts: {
    list: unknown[];
  };
  layers: unknown[];
}

interface StoreState {
  animation: AnimationState | null;
  setAnimation: (animation: AnimationState) => void;
  setFramerate: (newFramerate: number) => void;
  updateAnimation: (newValue: unknown, index: number) => void;
}

export const useAnimationStore = create<StoreState>((set) => ({
  animation: null,
  setAnimation: (animation) => set({ animation }),
  setFramerate: (newFramerate) =>
    set((state) => {
      if (state.animation) {
        return { animation: { ...state.animation, fr: newFramerate } };
      }
      return state;
    }),
  updateAnimation: (newValue, index) =>
    set((state) => {
      const paths = findPaths(state.animation);
      const updatedAnimation = R.assocPath(
        paths[index],
        newValue,
        state.animation
      ) as unknown as AnimationState;
      console.log(JSON.stringify(updatedAnimation));
      return { animation: updatedAnimation };
    }),
}));
