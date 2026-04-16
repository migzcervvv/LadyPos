import { useEffect, useState } from "react";

export function useServerReady() {
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const checkServer = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/health");

        if (!res.ok) throw new Error("Server not ready");

        if (isMounted) setReady(true);
      } catch (err) {
        if (isMounted) {
          setTimeout(() => {
            setAttempt((prev) => prev + 1);
          }, 2000);
        }
      }
    };

    checkServer();

    return () => {
      isMounted = false;
    };
  }, [attempt]);

  return { ready };
}
