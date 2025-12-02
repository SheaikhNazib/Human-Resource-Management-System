import React from "react";

export function Card({ children, className }) {
  return (
    <div className={`border rounded-xl bg-white shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
