"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"
import { Copy, Trash2, Clock, MoreHorizontal, Equal, ChevronsRight, ChevronsLeft, Pencil } from "lucide-react"
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
  "bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800/30 dark:to-indigo-800/30",
  "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800/30 dark:to-emerald-800/30",
  "bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-800/30 dark:to-violet-800/30",
  "bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-800/30 dark:to-rose-800/30",
  "bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-800/30 dark:to-yellow-800/30",
  "bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-800/30 dark:to-blue-800/30",
  "bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-800/30 dark:to-orange-800/30",
  "bg-gradient-to-br from-teal-100 to-cyan-200 dark:from-teal-800/30 dark:to-cyan-800/30",
]

// Text colors to match gradients
const textColors = [
  "text-blue-700 dark:text-blue-200",
  "text-green-700 dark:text-green-200",
  "text-purple-700 dark:text-purple-200",
  "text-pink-700 dark:text-pink-200",
  "text-amber-700 dark:text-amber-200",
  "text-indigo-700 dark:text-indigo-200",
  "text-red-700 dark:text-red-200",
  "text-teal-700 dark:text-teal-200",
]

interface TimezoneCardProps {
  timezone: string
  label: string
  currentDateTime: Date
  onTimeChange: (newTime: Date, timezone: string) => void
  onCopy: () => void
  onRemove: () => void
  onMoveLeft: (index: number) => void
  onMoveRight: (index: number) => void
  onRename: (label: string) => void
  colorIndex: number
  compact: boolean
  isLocal: boolean
}

export function TimezoneCard({
  timezone,
  label,
  currentDateTime,
  onTimeChange,
  onCopy,
  onRemove,
  onMoveLeft ,
  onMoveRight ,
  onRename,
  colorIndex,
  compact,
  isLocal,
}: TimezoneCardProps) {
  const [localTime, setLocalTime] = useState<Date>(toZonedTime(currentDateTime, timezone))
  const [dateTimeString, setDateTimeString] = useState<string>("")
  const [isDST, setIsDST] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false)
  const [labelInput, setLabelInput] = useState<string>(label)

  useEffect(() => {
    setLabelInput(label)
  }, [label])

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
          "transition-all duration-300 hover:shadow-xl shadow-md border overflow-hidden backdrop-blur-sm",
          gradient,
          isLocal && "ring-2 ring-primary"
        )}
      >
        <div className="p-5">
          {/* Header with timezone name and remove button */}
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h3 className={cn("font-semibold text-lg", textColor)}>{label}</h3>
              {!compact && (
                <p className={cn("text-xs opacity-70", textColor)}>{getTimezoneOffset(timezone)}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-background/20"
                  aria-label="More options"
                >
                  <Equal className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" >
                <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                  <Pencil className="mr-2 h-3 w-3" /> Rename
                </DropdownMenuItem>
                <hr />
                <DropdownMenuItem onClick={() => onMoveLeft(colorIndex)} >
                  <ChevronsLeft className="mr-2 h-3 w-3 text-sm" />
                  Move Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveRight(colorIndex)} >
                  <ChevronsRight className="mr-2 h-3 w-3 text-sm" />
                  Move Right
                </DropdownMenuItem>
                <hr></hr>
                <DropdownMenuItem onClick={handleDelete} className="text-sm text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-0 space-y-4">
            {/* Time display */}
            <div className="space-y-1">
              <div className={cn("text-4xl font-semibold tracking-tight", textColor)}>
                {format(localTime, "h:mm")}
                <span className="text-lg ml-1">{format(localTime, "a")}</span>
              </div>
              {!compact && (
                <div
                  className={cn(
                    "text-sm opacity-80 cursor-pointer underline underline-offset-1",
                    textColor,
                  )}
                  onClick={onCopy}
                >
                  {format(localTime, "EEEE, MMMM d, yyyy")}
                </div>
              )}
            </div>

            {!compact && (
              <>
                <div className="space-y-2">
                  <Input
                    id={`datetime-${timezone}`}
                    type="datetime-local"
                    value={dateTimeString}
                    onChange={handleTimeChange}
                    className={cn(
                      "bg-background/30 border-0 backdrop-blur-sm dark:text-white",
                      "focus:ring-2 focus:ring-primary/50 focus:bg-background/50",
                      textColor,
                    )}
                  />
                </div>

                {isDST && (
                  <div className="text-xs bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-2 rounded-md backdrop-blur-sm">
                    Currently in Daylight Saving Time
                  </div>
                )}
              </>
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

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <Label htmlFor="label-input">Label</Label>
            <Input
              id="label-input"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onRename(labelInput)
                setRenameDialogOpen(false)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

