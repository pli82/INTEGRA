"use client";

export function ConfirmButton({
  mesaj,
  className,
  children,
}: {
  mesaj: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(mesaj)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}