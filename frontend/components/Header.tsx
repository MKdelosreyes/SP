"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, MenuIcon, MenuSquare } from "lucide-react";

export default function Header() {
  return (
    <header className="absolute z-10 top-0 md:p-6h-14 w-full rounded-2xl flex">
      <div className="bg-white w-full m-2 p-3 flex items-center justify-between rounded-2xl font-(--font-mono) border border-gray-300">
        <a href="#" className="w-28 md:w-32">
          <Image
            src={"/pandiwa-logo-text-p.svg"}
            alt="Logo"
            width={100}
            height={20}
            priority
            className="transition-all duration-300"
          />
        </a>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex flex-row gap-2 items-center justify-center">
            <Avatar className="w-8 h-8 md:w-10 md:h-10 relative ring-2 ring-blue-500 shadow-[0_0_12px_3px_rgba(13,81,125,0.5)]">
              <AvatarImage
                alt="Student Avatar"
                className="object-cover"
                //   src={}
              />
              <AvatarFallback className="bg-blue-900 text-white text-xs md:text-sm">
                GU
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-bold text-sm md:text-base text-blue-950">
                Test One
              </span>
              <span className="text-xs text-blue-700 hidden md:block">
                test@example.com
              </span>
            </div>
          </div>

          {/* Mobile: Avatar only */}
          <div className="sm:hidden">
            <Avatar className="w-8 h-8 relative ring-2 ring-blue-500 shadow-[0_0_12px_3px_rgba(13,81,125,0.5)]">
              <AvatarImage alt="Student Avatar" className="object-cover" />
              <AvatarFallback className="bg-blue-900 text-white text-xs">
                GU
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Menu Button */}
          <button
            //   onClick={() => setMenuOpen(!menuOpen)}
            className="p-1"
            aria-label="Open menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="menu"
                initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                <MenuIcon className="w-5 h-5 md:w-5 md:h-5 text-blue-950" />
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
}
