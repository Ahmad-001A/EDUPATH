"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<"in" | "out">("in");

  useEffect(() => {
    setTransitionStage("out");
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage("in");
    }, 120);
    return () => clearTimeout(t);
  }, [pathname, children]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionStage === "in"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {displayChildren}
    </div>
  );
}