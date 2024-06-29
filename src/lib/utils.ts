/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const toRGBADecimal = (arr) =>
  arr.map((v, i) => (i != 3 && arr[3] != 0 ? Math.round(v * 255) : v));
const toRGBADecimalGradient = (arr) => {
  return arr.map((v, i) => {
    if (i != 0 && v % 4 == 0) {
      return v;
    } else {
      return Math.round(v * 255);
    }
  });
};

export const findItemPath = (items) => {
  let path = [];

  items.forEach((item, i) => {
    if ("it" in item) {
      let items = findItemPath(item.it);

      if (items.length > 0) {
        items = items.map((colorObj) => {
          colorObj.itemPath.push(i);
          colorObj.itemName =
            "nm" in item
              ? item.nm + " -> " + colorObj.itemName
              : "Item " + i + " -> " + colorObj.itemName;
          return colorObj;
        });
      }

      path = path.concat(items);
    } else if (item.ty == "fl" || item.ty == "st") {
      //solid fill || stroke

      const itemName =
        "nm" in item ? item.nm : item.ty == "fl" ? "Fill 1" : "Stroke 1";
      if (item.c.a == 0) {
        const color = toRGBADecimal(item.c.k);
        path.push({
          type: item.ty,
          itemName: itemName,
          itemPath: [i],
          color: color,
          keyFramed: false,
        });
      } else if (item.c.a == 1) {
        //color has keyframes
        const colors = [];
        item.c.k.forEach((v, i) => {
          if ("s" in v) {
            const startColor = toRGBADecimal(v.s);
            //some json files don't have end color property, use 255 as a filler--not used for anything
            //just allows the hash value to be start + end color
            const endColor = "e" in v ? toRGBADecimal(v.e) : [255, 255, 255, 0];
            colors.push({
              time: v.t,
              start: startColor,
              end: endColor,
              index: i,
            });
          }
        });

        path.push({
          type: item.ty,
          itemName: itemName,
          itemPath: [i],
          color: colors,
          keyFramed: true,
        });
      }
    } else if (item.ty == "gf" || item.ty == "gs") {
      //gradient fill/stroke
      const itemName =
        "nm" in item
          ? item.nm
          : item.ty == "gf"
          ? "Gradient Fill 1"
          : "Gradient Stroke 1";
      if (item.g.k.a == 0) {
        const color = toRGBADecimalGradient(item.g.k.k);
        path.push({
          type: item.ty,
          itemName: itemName,
          itemPath: [i],
          color: color,
          keyFramed: false,
        });
      } else if (item.g.k.a == 1) {
        //gradient has keyframes
        const colors = [];
        item.g.k.k.forEach((v, i) => {
          if ("s" in v && "e" in v) {
            const startColor = toRGBADecimalGradient(v.s);
            const endColor = toRGBADecimalGradient(v.e);
            colors.push({
              time: v.t,
              start: startColor,
              end: endColor,
              index: i,
            });
          }
        });
        path.push({
          type: item.ty,
          itemName: itemName,
          itemPath: [i],
          keyFramed: true,
          color: colors,
        });
      }
    }
  });

  return path;
};
