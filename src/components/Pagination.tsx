"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={cn(
            "h-10 w-10 rounded-lg text-sm font-bold transition-all",
            1 === currentPage
              ? "bg-[#B11226] text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          1
        </button>
      )
      
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="text-slate-400 font-bold">...</span>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            "h-10 w-10 rounded-lg text-sm font-bold transition-all",
            i === currentPage
              ? "bg-[#B11226] text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {i}
        </button>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="text-slate-400 font-bold">...</span>
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={cn(
            "h-10 w-10 rounded-lg text-sm font-bold transition-all",
            totalPages === currentPage
              ? "bg-[#B11226] text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-sm text-slate-500 font-medium">
        Mostrando <span className="font-bold text-slate-900">{startItem}</span> a{" "}
        <span className="font-bold text-slate-900">{endItem}</span> de{" "}
        <span className="font-bold text-slate-900">{totalItems}</span> equipamentos
      </p>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
