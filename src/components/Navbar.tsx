// src/components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { FileSpreadsheet, ExternalLink } from "lucide-react";
import { version } from "../../package.json";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);

  // read localStorage on mount
  useEffect(() => {
    const flag = localStorage.getItem("loggedIn");
    setLoggedIn(flag === "true");

    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) setEmail(userEmail);
  }, []);

  // listen for storage changes (another tab or after login)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "loggedIn") {
        setLoggedIn(e.newValue === "true");
      }
      if (e.key === "userEmail") {
        setEmail(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    setLoggedIn(false);
    setEmail(null);
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-[1800px] px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link href="https://byteswrite.com" target="_blank" rel="noreferrer">
            <Image
              src="https://res.cloudinary.com/bw-cdn/image/upload/v1747276931/byteswriteLogoLightLong.png"
              alt="BytesWrite"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden sm:block w-px h-6 bg-gray-300" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">ERPNext CRM Parser</span>
            <span className="hidden md:inline text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium border border-blue-200">v{version}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://byteswrite.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <span className="hidden sm:inline">BytesWrite.com</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <a href="mailto:contact@byteswrite.com" className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">Support</a>

          {/* Show email if available */}
          {loggedIn && email && <span className="text-sm text-gray-800">Hello, {email}</span>}

          {/* Logout button only when loggedIn */}
          {loggedIn && (
            <button onClick={handleLogout} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
