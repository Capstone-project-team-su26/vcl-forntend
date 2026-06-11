"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";

type AppLogoVariant = "header" | "sidebar" | "auth" | "register" | "register-mobile";

type AppLogoProps = {
  variant?: AppLogoVariant;
  className?: string;
};

export default function AppLogo({ variant = "sidebar", className = "" }: AppLogoProps) {
  if (variant === "header") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
      >
        <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center">
          <img src="./assets/IMG_1.svg" alt="SwiftShip" className="w-6 h-6" />
        </div>
        <span className="text-[20px] font-[900] tracking-[-1px] uppercase">SWIFTSHIP</span>
      </Link>
    );
  }

  if (variant === "auth") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2.5 hover:opacity-80 transition-opacity ${className}`}
      >
        <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
          <Icon icon="lucide:package" className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-ink tracking-tight">SwiftShip</span>
      </Link>
    );
  }

  if (variant === "register") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}
      >
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
          <img src="./assets/IMG_1.svg" alt="LogiAccess" className="w-8 h-8" />
        </div>
        <span className="text-secondary text-[31px] font-bold tracking-tight">LogiAccess</span>
      </Link>
    );
  }

  if (variant === "register-mobile") {
    return (
      <Link
        href="/"
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
      >
        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
          <img src="./assets/IMG_1.svg" alt="LogiAccess" className="w-5 h-5" />
        </div>
        <span className="text-secondary text-xl font-bold">LogiAccess</span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`flex items-center hover:opacity-80 transition-opacity ${className}`}
    >
      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
        <img src="./assets/IMG_1.svg" alt="SwiftShip" className="w-5.5 h-5.5" />
      </div>
      <span className="font-['Oswald'] text-xl font-black text-primary tracking-tight">SwiftShip</span>
    </Link>
  );
}
