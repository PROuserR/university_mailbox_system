/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useMediaQuery.ts
"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// ========== الشاشات الصغيرة جداً (موبايل صغير) ==========
export function useSmallMobileScreen() {
  return useMediaQuery("(max-width: 480px)");
}

// ========== موبايل عادي (أيفون، أندرويد) ==========
export function useMobileScreen() {
  return useMediaQuery("(max-width: 768px)");
}

// ========== تابلت صغير (مثل iPad Mini في الوضع العمودي) ==========
export function useSmallTabletScreen() {
  return useMediaQuery("(min-width: 769px) and (max-width: 834px)");
}

// ========== تابلت متوسط (مثل iPad Air في الوضع العمودي) ==========
export function useMediumTabletScreen() {
  return useMediaQuery("(min-width: 835px) and (max-width: 1024px)");
}

// ========== تابلت كبير / ديسكتوب صغير (iPad Pro، شاشات صغيرة) ==========
export function useLargeTabletScreen() {
  return useMediaQuery("(min-width: 1025px) and (max-width: 1280px)");
}

// ========== ديسكتوب عادي (أكبر من 1280px) ==========
export function useDesktopScreen() {
  return useMediaQuery("(min-width: 1281px)");
}

// ========== أي جهاز لوحي (تابلت) ==========
export function useAnyTabletScreen() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1280px)");
}

// ========== أي جهاز غير ديسكتوب (موبايل + تابلت) ==========
export function useMobileOrTablet() {
  return useMediaQuery("(max-width: 1280px)");
}

// ========== نقطة التحول الأساسية (بسيطة) - الموصى بها ==========
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)");
}

export function useTabletScreen() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1280px)");
}
