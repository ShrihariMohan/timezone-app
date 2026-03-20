"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"
import { Trash2, Equal, Pencil, Palette, Calendar } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }))
  return (tzDate.getTime() - utcDate.getTime()) / 60000
}

function checkIsDST(date: Date, timezone: string): boolean {
  const year = date.getFullYear()
  const jan = new Date(year, 0, 1, 12)
  const jul = new Date(year, 6, 1, 12)
  
  const janOffset = getTimezoneOffsetMinutes(jan, timezone)
  const julOffset = getTimezoneOffsetMinutes(jul, timezone)
  const currentOffset = getTimezoneOffsetMinutes(date, timezone)
  
  const standardOffset = Math.min(janOffset, julOffset)
  const dstOffset = Math.max(janOffset, julOffset)
  
  if (standardOffset === dstOffset) return false
  
  return currentOffset === dstOffset
}

// Array of modern gradient backgrounds
const gradients = [
  // Blues & Purples
  "bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40",
  "bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/40 dark:to-blue-900/40",
  "bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-900/40",
  "bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-900/40 dark:to-purple-900/40",
  "bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/40 dark:to-sky-900/40",
  "bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/40 dark:to-blue-900/40",
  // Greens & Teals
  "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40",
  "bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40",
  "bg-gradient-to-br from-teal-100 to-cyan-200 dark:from-teal-900/40 dark:to-cyan-900/40",
  "bg-gradient-to-br from-lime-100 to-green-200 dark:from-lime-900/40 dark:to-green-900/40",
  // Warm colors
  "bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40",
  "bg-gradient-to-br from-rose-100 to-red-200 dark:from-rose-900/40 dark:to-red-900/40",
  "bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-900/40",
  "bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/40 dark:to-amber-900/40",
  "bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40",
  "bg-gradient-to-br from-yellow-100 to-lime-200 dark:from-yellow-900/40 dark:to-lime-900/40",
  // Special gradients
  "bg-gradient-to-br from-fuchsia-100 to-pink-200 dark:from-fuchsia-900/40 dark:to-pink-900/40",
  "bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-800/60 dark:to-gray-800/60",
  "bg-gradient-to-br from-stone-100 to-neutral-200 dark:from-stone-800/60 dark:to-neutral-800/60",
  "bg-gradient-to-br from-zinc-100 to-slate-200 dark:from-zinc-800/60 dark:to-slate-800/60",
  // Dual-tone gradients
  "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-pink-900/40",
  "bg-gradient-to-br from-green-100 via-teal-100 to-cyan-200 dark:from-green-900/40 dark:via-teal-900/40 dark:to-cyan-900/40",
  "bg-gradient-to-br from-orange-100 via-red-100 to-pink-200 dark:from-orange-900/40 dark:via-red-900/40 dark:to-pink-900/40",
  "bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-200 dark:from-yellow-900/40 dark:via-amber-900/40 dark:to-orange-900/40",
]

// Text colors to match gradients
const textColors = [
  // Blues & Purples
  "text-blue-700 dark:text-blue-200",
  "text-indigo-700 dark:text-indigo-200",
  "text-purple-700 dark:text-purple-200",
  "text-violet-700 dark:text-violet-200",
  "text-cyan-700 dark:text-cyan-200",
  "text-sky-700 dark:text-sky-200",
  // Greens & Teals
  "text-green-700 dark:text-green-200",
  "text-emerald-700 dark:text-emerald-200",
  "text-teal-700 dark:text-teal-200",
  "text-lime-700 dark:text-lime-200",
  // Warm colors
  "text-pink-700 dark:text-pink-200",
  "text-rose-700 dark:text-rose-200",
  "text-red-700 dark:text-red-200",
  "text-orange-700 dark:text-orange-200",
  "text-amber-700 dark:text-amber-200",
  "text-yellow-700 dark:text-yellow-200",
  // Special
  "text-fuchsia-700 dark:text-fuchsia-200",
  "text-slate-700 dark:text-slate-200",
  "text-stone-700 dark:text-stone-200",
  "text-zinc-700 dark:text-zinc-200",
  // Dual-tone
  "text-purple-700 dark:text-purple-200",
  "text-teal-700 dark:text-teal-200",
  "text-rose-700 dark:text-rose-200",
  "text-orange-700 dark:text-orange-200",
]

const colorNames = [
  // Blues & Purples
  "Ocean Blue",
  "Indigo Sky",
  "Royal Purple",
  "Violet Dream",
  "Aqua Cyan",
  "Sky Blue",
  // Greens & Teals
  "Emerald Green",
  "Emerald Teal",
  "Teal Breeze",
  "Lime Fresh",
  // Warm colors
  "Rose Pink",
  "Rose Red",
  "Sunset Red",
  "Orange Burst",
  "Sunny Amber",
  "Lemon Yellow",
  // Special
  "Fuchsia Pop",
  "Slate Gray",
  "Stone Neutral",
  "Zinc Steel",
  // Dual-tone
  "Aurora",
  "Sea Breeze",
  "Sunset Glow",
  "Golden Hour",
]

const colorSwatches = [
  // Blues & Purples
  "bg-blue-400",
  "bg-indigo-400",
  "bg-purple-400",
  "bg-violet-400",
  "bg-cyan-400",
  "bg-sky-400",
  // Greens & Teals
  "bg-green-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-lime-400",
  // Warm colors
  "bg-pink-400",
  "bg-rose-400",
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-yellow-400",
  // Special
  "bg-fuchsia-400",
  "bg-slate-400",
  "bg-stone-400",
  "bg-zinc-400",
  // Dual-tone (using gradient for swatches)
  "bg-gradient-to-r from-blue-400 to-pink-400",
  "bg-gradient-to-r from-green-400 to-cyan-400",
  "bg-gradient-to-r from-orange-400 to-pink-400",
  "bg-gradient-to-r from-yellow-400 to-orange-400",
]

interface TimezoneCardProps {
  timezone: string
  label: string
  currentDateTime: Date
  onTimeChange: (newTime: Date, timezone: string) => void
  onCopy: () => void
  onRemove: () => void
  onRename: (label: string) => void
  onColorChange: (index: number) => void
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
  onRename,
  onColorChange,
  colorIndex,
  compact,
  isLocal,
}: TimezoneCardProps) {
  const [localTime, setLocalTime] = useState<Date>(toZonedTime(currentDateTime, timezone))
  const [dateTimeString, setDateTimeString] = useState<string>("")
  const [isDST, setIsDST] = useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false)
  const [labelInput, setLabelInput] = useState<string>(label)
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLabelInput(label)
  }, [label])

  const gradient = gradients[colorIndex % gradients.length]
  const textColor = textColors[colorIndex % textColors.length]

  useEffect(() => {
    const zonedTime = toZonedTime(currentDateTime, timezone)
    setLocalTime(zonedTime)
    setDateTimeString(format(zonedTime, "yyyy-MM-dd'T'HH:mm"))
    setIsDST(checkIsDST(currentDateTime, timezone))
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

  const handleInputContainerClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker()
    }
  }

  return (
    <>
      <Card
        className={cn(
          "group relative transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-primary/10 shadow-lg",
          "border border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-sm",
          "hover:-translate-y-1 hover:scale-[1.02]",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
          gradient,
          isLocal && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h3 className={cn(
                "font-semibold text-lg transition-all duration-300",
                "group-hover:tracking-wide",
                textColor
              )}>
                {label}
              </h3>
              {!compact && (
                <p className={cn(
                  "text-xs opacity-70 transition-opacity duration-300 group-hover:opacity-90",
                  textColor
                )}>
                  {getTimezoneOffset(timezone)}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-300",
                    "hover:bg-background/30 hover:scale-110",
                    "active:scale-95"
                  )}
                  aria-label="More options"
                >
                  <Equal className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-in fade-in-0 zoom-in-95 duration-200">
                <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                  <Pencil className="mr-2 h-3 w-3" /> Rename
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-3 w-3" /> Color
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={colorIndex.toString()} onValueChange={(v) => onColorChange(Number(v))}>
                      {colorNames.map((name, idx) => (
                        <DropdownMenuRadioItem key={idx} value={idx.toString()} className="flex items-center gap-2">
                          <span className={cn(
                            "h-3 w-3 rounded-full transition-transform duration-200 hover:scale-125",
                            colorSwatches[idx]
                          )} />
                          {name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <hr />
                <DropdownMenuItem onClick={handleDelete} className="text-sm text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-0 space-y-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap mb-2">
                <div className={cn(
                  "text-4xl font-semibold tracking-tight transition-all duration-300",
                  "group-hover:scale-105 origin-left",
                  textColor
                )}>
                  <span className="tabular-nums">{format(localTime, "h:mm")}</span>
                  <span className="text-lg ml-1 opacity-80">{format(localTime, "a")}</span>
                </div>
                {isDST && (
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    "bg-yellow-200/80 dark:bg-yellow-800/60",
                    "text-yellow-800 dark:text-yellow-200",
                    "border border-yellow-300/50 dark:border-yellow-600/50",
                    "animate-in fade-in-0 zoom-in-95 duration-300",
                    "whitespace-nowrap" , "ml-2"
                  )}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500" />
                    </span>
                    DST
                  </span>
                )}
              </div>
              {!compact && (
                <div
                  className={cn(
                    "text-sm opacity-80 cursor-pointer",
                    "underline underline-offset-2 decoration-dotted",
                    "hover:opacity-100 hover:decoration-solid",
                    "transition-all duration-200",
                    textColor,
                  )}
                  onClick={onCopy}
                >
                  {format(localTime, "EEEE, MMMM d, yyyy")}
                </div>
              )}
            </div>

            {!compact && (
              <div
                className={cn(
                  "relative flex items-center gap-2 rounded-lg cursor-pointer",
                  "bg-background/30 hover:bg-background/50",
                  "border border-transparent hover:border-primary/30",
                  "transition-all duration-300 group/input",
                  "focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-background/50"
                )}
                onClick={handleInputContainerClick}
              >
                <Calendar className={cn(
                  "absolute left-3 h-4 w-4 pointer-events-none",
                  "text-current opacity-60 group-hover/input:opacity-100",
                  "transition-all duration-200 group-hover/input:scale-110",
                  textColor
                )} />
                <Input
                  ref={dateInputRef}
                  id={`datetime-${timezone}`}
                  type="datetime-local"
                  value={dateTimeString}
                  onChange={handleTimeChange}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "pl-10 bg-transparent border-0 cursor-pointer",
                    "focus:ring-0 focus:ring-offset-0",
                    "[&::-webkit-calendar-picker-indicator]:opacity-0",
                    "[&::-webkit-calendar-picker-indicator]:absolute",
                    "[&::-webkit-calendar-picker-indicator]:inset-0",
                    "[&::-webkit-calendar-picker-indicator]:w-full",
                    "[&::-webkit-calendar-picker-indicator]:h-full",
                    "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                    textColor,
                  )}
                />
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

