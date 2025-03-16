"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"
import { Copy, Trash2, Clock, MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getTimezoneOffset } from "@/lib/timezone-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Array of modern gradient backgrounds
const gradients = [
  "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40",
  "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40",
  "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40",
  "bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40",
  "bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40",
  "bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40",
  "bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40",
  "bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40",
]

// Text colors to match gradients
const textColors = [
  "text-blue-800 dark:text-blue-200",
  "text-green-800 dark:text-green-200",
  "text-purple-800 dark:text-purple-200",
  "text-pink-800 dark:text-pink-200",
  "text-amber-800 dark:text-amber-200",
  "text-indigo-800 dark:text-indigo-200",
  "text-red-800 dark:text-red-200",
  "text-teal-800 dark:text-teal-200",
]

interface TimezoneCardProps {
  timezone: string
  currentDateTime: Date
  onTimeChange: (newTime: Date, timezone: string) => void
  onCopy: () => void
  onRemove: () => void
  colorIndex: number
}

export function TimezoneCard({
  timezone,
  currentDateTime,
  onTimeChange,
  onCopy,
  onRemove,
  colorIndex,
}: TimezoneCardProps) {
  const [localTime, setLocalTime] = useState<Date>(toZonedTime(currentDateTime, timezone))
  const [dateTimeString, setDateTimeString] = useState<string>("")
  const [isDST, setIsDST] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  // Get gradient and text color based on index
  const gradient = gradients[colorIndex % gradients.length]
  const textColor = textColors[colorIndex % textColors.length]

  // Update local time when current date time changes
  useEffect(() => {
    const zonedTime = toZonedTime(currentDateTime, timezone)
    setLocalTime(zonedTime)

    // Format for datetime-local input
    setDateTimeString(format(zonedTime, "yyyy-MM-dd'T'HH:mm"))

    // Check if timezone is currently in DST
    const jan = new Date(zonedTime.getFullYear(), 0, 1)
    const jul = new Date(zonedTime.getFullYear(), 6, 1)
    const janOffset = toZonedTime(jan, timezone).getTimezoneOffset()
    const julOffset = toZonedTime(jul, timezone).getTimezoneOffset()
    setIsDST(Math.max(janOffset, julOffset) !== zonedTime.getTimezoneOffset())
  }, [currentDateTime, timezone])

  // Handle time change from input
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateTimeString = e.target.value
    setDateTimeString(newDateTimeString)

    if (newDateTimeString) {
      const newLocalTime = new Date(newDateTimeString)
      const newUtcTime = fromZonedTime(newLocalTime, timezone)
      onTimeChange(newUtcTime, timezone)
    }
  }

  // Format the timezone name for display
  const formatTimezoneName = (tz: string) => {
    return tz.replace(/_/g, " ").replace(/\//g, " / ")
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    onRemove()
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <Card
        className={cn(
          "transition-all  duration-300 hover:shadow-lg border overflow-hidden backdrop-blur-sm",
          gradient,
          "hover:scale-[1.02]",
        )}
      >
        <div className="p-5">
          {/* Header with timezone name and remove button */}
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h3 className={cn("font-medium text-sm", textColor)}>{formatTimezoneName(timezone)}</h3>
              <p className={cn("text-xs opacity-70", textColor)}>{getTimezoneOffset(timezone)}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-background/20"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-0 space-y-4">
            {/* Time display */}
            <div className="space-y-1">
              <div className={cn("text-3xl font-bold tracking-tight", textColor)}>
                {format(localTime, "h:mm")}
                <span className="text-lg ml-1">{format(localTime, "a")}</span>
              </div>
              <div className={cn("text-sm opacity-80 cursor-pointer underline underline-offset-1", textColor)} onClick={onCopy}>
                {format(localTime, "EEEE, MMMM d, yyyy")}
              </div>
            </div>

            {/* Custom Time Input - Always visible unless editing */}
            <div className="space-y-2">
              <Input
                id={`datetime-${timezone}`}
                type="datetime-local"
                value={dateTimeString}
                onChange={handleTimeChange}
                className={cn(
                  "bg-background/30 border-0 backdrop-blur-sm",
                  "focus:ring-2 focus:ring-primary/50 focus:bg-background/50",
                  textColor,
                )}
              />
            </div>

            {/* DST indicator */}
            {isDST && (
              <div className="text-xs bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-2 rounded-md backdrop-blur-sm">
                Currently in Daylight Saving Time
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Delete Confirmation Dialog - Using Dialog instead of AlertDialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will remove the timezone "{formatTimezoneName(timezone)}" from your list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

