import { useEffect, useState } from "react";

/** True sau khi client hydrate xong — dùng để tránh mismatch với state lưu ở localStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
