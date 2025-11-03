import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function Button({ children, ...rest }: Props) {
  return (
    <button
      className="px-4 py-2 rounded-xl shadow-sm bg-black text-white hover:opacity-90 focus:outline-none"
      {...rest}
    >
      {children}
    </button>
  );
}
