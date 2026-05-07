"use client";

import { useAuthedContext } from "@/app/providers";

export function useAuthed(): boolean {
  return useAuthedContext();
}
