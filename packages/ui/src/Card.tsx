import React from "react";

type Props = { children: React.ReactNode; className?: string; };

export function Card({ children, className }: Props) {
  return (
    <div className={`rounded-2xl shadow-sm border border-neutral-200 p-4 bg-white ${className||""}`}>
      {children}
    </div>
  );
}
