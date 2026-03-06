"use client";

import Link from "next/link";

export default function Navbar({ links = [], onLogout }) {
  return (
    <nav className="border-b border-gray-200">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">
          Prompt Playground
        </span>
        <div className="flex items-center gap-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              {label}
            </Link>
          ))}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
