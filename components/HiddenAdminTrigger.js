"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function HiddenAdminTrigger({ children, className }) {
  const router = useRouter();
  const countRef = useRef(0);
  const timerRef = useRef(null);

  function handleTap() {
    countRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, 700);

    if (countRef.current >= 3) {
      countRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      router.push("/admin");
    }
  }

  return (
    <span onClick={handleTap} className={className} style={{ cursor: "default" }}>
      {children}
    </span>
  );
}
