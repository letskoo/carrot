"use client";

import { useEffect, useRef, useState } from "react";

export default function SlideInOnScroll({
  children,
  direction = "left",
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const startX = direction === "left" ? "-80px" : "80px";

  return (
    <div
      ref={ref}
      style={{
        transform: visible ? "translateX(0)" : `translateX(${startX})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.9s ease-out",
      }}
    >
      {children}
    </div>
  );
}
