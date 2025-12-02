"use client";

import React from 'react'
import { Button } from '@/components/ui/button'

export default function PaginationControls({ currentPage = 1, totalItems = 0, perPage = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  const goPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const goNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  if (totalItems === 0) return null

  return (
    <div className="flex items-center justify-center mt-6 space-x-4">
      <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1}>
        Previous
      </Button>

      <div className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>

      <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage === totalPages}>
        Next
      </Button>
    </div>
  )
}
