import {useState} from "react";

export function useSetWithLocalStorage<T>(key: string): [Set<T>, (value: T) => void] {
  const [state, setState] = useState<Set<T>>(() => {
    const item = localStorage.getItem(key);
    if (item) {
      return new Set(JSON.parse(item));
    } else {
      return new Set();
    }
  });

  const toggle = (value: T) => {
    setState((previous) => {
      const newValue = new Set(previous);
      if (newValue.has(value)) {
        newValue.delete(value);
      } else {
        newValue.add(value);
      }

      localStorage.setItem(key, JSON.stringify(Array.from(newValue.values())));

      return newValue;
    });
  };

  return [state, toggle];
}
