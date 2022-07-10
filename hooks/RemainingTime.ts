import {useState} from "react";

export default function useRemainingTime(progress: number): number {
  const now = Date.now();
  const [startedAt] = useState(now);
  const elapsed = now - startedAt;

  return Math.floor(((elapsed * 100) / progress - elapsed) / 1000);
}
