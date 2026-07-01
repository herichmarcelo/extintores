"use client"

import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, alt = "User", size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  return (
    <div className={cn(
      "rounded-full bg-slate-100 border border-[#E5E7EB] flex items-center justify-center overflow-hidden",
      sizes[size], className
    )}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-slate-400" />
      )}
    </div>
  )
}
