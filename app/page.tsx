"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { Plus, Sun, Moon, Search, ChevronUp, ChevronDown, RefreshCcw, Maximize2, Minimize2, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { TimezoneCard } from "@/components/timezone-card"
import { getAllTimezones } from "@/lib/timezones"
import { getTimezoneOffset } from "@/lib/timezone-utils"
import { toast } from "sonner"

export default function TimezoneApp() {
  const [timezones, setTimezones] = useState<string[]>([])
  const [allTimezones, setAllTimezones] = useState<string[]>([])
  const [selectedTimezone, setSelectedTimezone] = useState<string>("")
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date())
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [showToolbar, setShowToolbar] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [timezoneLabels, setTimezoneLabels] = useState<Record<string, string>>({})
  const [timezoneColors, setTimezoneColors] = useState<Record<string, number>>({})
  const [compactView, setCompactView] = useState<boolean>(false)
  const [userTimezone, setUserTimezone] = useState<string>("")

  // Initialize timezones and theme
  useEffect(() => {
    const storedTimezones = localStorage.getItem("timezones")
    const storedTheme = localStorage.getItem("darkMode")
    const storedLabels = localStorage.getItem("timezoneLabels")
    const storedColors = localStorage.getItem("timezoneColors")
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    setUserTimezone(detectedTimezone)

    // Set theme from localStorage
    if (storedTheme) {
      setDarkMode(storedTheme === "true")
    } else {
      // Check system preference as fallback
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(prefersDark)
    }

    // Set all available timezones
    setAllTimezones(getAllTimezones())

    if (storedLabels) {
      setTimezoneLabels(JSON.parse(storedLabels))
    }
    if (storedColors) {
      setTimezoneColors(JSON.parse(storedColors))
    }

    if (storedTimezones) {
      const tzs = JSON.parse(storedTimezones) as string[]
      setTimezones(tzs)
      if (!storedColors) {
        const defaultColors: Record<string, number> = {}
        tzs.forEach((tz, idx) => {
          defaultColors[tz] = idx
        })
        setTimezoneColors(defaultColors)
        localStorage.setItem("timezoneColors", JSON.stringify(defaultColors))
      }
    } else {
      // Default timezones: user's local, UTC, and a random one
      const availableTimezones = getAllTimezones().filter((tz) => tz !== detectedTimezone && tz !== "UTC")
      const randomTimezone = availableTimezones[Math.floor(Math.random() * availableTimezones.length)]
      const defaultTimezones = ["UTC", detectedTimezone, "America/North_Dakota/Center", "America/New_York"]
      setTimezones(defaultTimezones)
      localStorage.setItem("timezones", JSON.stringify(defaultTimezones))
      const defaultColors: Record<string, number> = {}
      defaultTimezones.forEach((tz, idx) => {
        defaultColors[tz] = idx
      })
      setTimezoneColors(defaultColors)
      localStorage.setItem("timezoneColors", JSON.stringify(defaultColors))
    }

    // Update time periodically when auto update is enabled
    let interval: NodeJS.Timeout | undefined
    if (autoUpdate) {
      interval = setInterval(() => {
        setCurrentDateTime(new Date())
      }, 20000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoUpdate])

  useEffect(() => {
    localStorage.setItem("timezoneLabels", JSON.stringify(timezoneLabels))
  }, [timezoneLabels])

  useEffect(() => {
    localStorage.setItem("timezoneColors", JSON.stringify(timezoneColors))
  }, [timezoneColors])

  // Save timezones to localStorage when they change
  useEffect(() => {
    if (timezones.length > 0) {
      localStorage.setItem("timezones", JSON.stringify(timezones))
    }
  }, [timezones])

  // Toggle dark mode and save to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  const addTimezone = () => {
    if (selectedTimezone && !timezones.includes(selectedTimezone)) {
      setTimezones([...timezones, selectedTimezone])
      setTimezoneColors((colors) => ({
        ...colors,
        [selectedTimezone]: timezones.length,
      }))
      setTimezoneLabels((labels) => ({
        ...labels,
        [selectedTimezone]: selectedTimezone.replace(/_/g, " "),
      }))
      setSelectedTimezone("")
      setPopoverOpen(false)
      toast(selectedTimezone, {
        description: `Added ${selectedTimezone} to your list`,
        action: {
          label: "Done",
          onClick: () => console.log("done"),
        },
      })
    }
  }

  const removeTimezone = (timezone: string) => {
    setTimezones(timezones.filter((tz) => tz !== timezone))
    setTimezoneColors((colors) => {
      const updated = { ...colors }
      delete updated[timezone]
      return updated
    })
    setTimezoneLabels((labels) => {
      const updated = { ...labels }
      delete updated[timezone]
      return updated
    })
    toast(timezone, {
        description: `Removed ${timezone} from your list`,
        action: {
          label: "Removed",
          onClick: () => console.log("Removed"),
        },
      })
  }

  const updateTime = (newTime: Date, timezone: string) => {
    setAutoUpdate(false)
    setCurrentDateTime(newTime)
  }

  const copyTimeToClipboard = (timezone: string) => {
    const time = toZonedTime(currentDateTime, timezone)
    const formattedTime = format(time, "PPpp")
    navigator.clipboard.writeText(formattedTime)
    toast(timezone, {
      description: formattedTime,
      action: {
        label: "Copied",
        onClick: () => console.log("Copied"),
      },
    })

  }

  const renameTimezone = (tz: string, newLabel: string) => {
    setTimezoneLabels((labels) => ({ ...labels, [tz]: newLabel }))
  }

  const updateColor = (tz: string, index: number) => {
    setTimezoneColors((colors) => ({ ...colors, [tz]: index }))
  }
  

  const toggleToolbar = () => {
    setShowToolbar(!showToolbar)
  }

  const resetTime = () => {
    setCurrentDateTime(new Date())
    setAutoUpdate(true)
  }

  // Drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null)
      return
    }
    const updatedTimezones = [...timezones]
    const [moved] = updatedTimezones.splice(draggedIndex, 1)
    updatedTimezones.splice(index, 0, moved)
    setDraggedIndex(null)
    setTimezones(updatedTimezones)
  }


  // Filter timezones based on search query
  const filteredTimezones = allTimezones.filter(
    (tz) => !timezones.includes(tz) && tz.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      className={cn(
        "min-h-screen p-4 md:p-8 md:pb-16 transition-colors",
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900",
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Timezone Converter</h1>
        </header> */}

        {/* <div className="mb-8 text-center">
          <Link
            href="/chrome-extension"
            className="text-sm underline underline-offset-4 hover:text-primary transition-colors"
          >
            Learn how to use this as a Chrome extension
          </Link>
        </div> */}

        {/* Floating Glassmorphism Toolbar */}
        <div className="fixed bottom-0  sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10 ">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              showToolbar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none",
            )}
          >
            <div className="flex items-center gap-4 p-4 sm:rounded-full backdrop-blur-md bg-background/60 border border-background/20 shadow-lg">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] md:w-[320px] justify-between bg-background/50 border-0"
                  >
                    {selectedTimezone ? selectedTimezone.replace(/_/g, " ") : "Select a timezone"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] md:w-[320px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search timezone..." value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup>
                        {filteredTimezones.map((tz) => {
                          const offset = getTimezoneOffset(tz)
                          return (
                            <CommandItem
                              key={tz}
                              value={tz}
                              onSelect={(value) => {
                                setSelectedTimezone(value)
                                setSearchQuery("")
                                setPopoverOpen(false) // Close popover on selection
                              }}
                            >
                              <span className="flex justify-between w-full">
                                <span>{tz.replace(/_/g, " ")}</span>
                                <span className="text-muted-foreground ml-2">{offset}</span>
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>

                </PopoverContent>
              </Popover>

              <Button
                onClick={addTimezone}
                disabled={!selectedTimezone || timezones.includes(selectedTimezone)}
                className="rounded-full bg-primary/80 hover:bg-primary"
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="bg-background/50 backdrop-blur-sm border-0 hover:bg-background/70 rounded-full"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={resetTime}
                className="bg-background/50 backdrop-blur-sm border-0 hover:bg-background/70 rounded-full"
                aria-label="Reset to current time"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCompactView(!compactView)}
                className="bg-background/50 backdrop-blur-sm border-0 hover:bg-background/70 rounded-full"
                aria-label="Toggle view"
              >
                {compactView ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Improved Toggle button for toolbar */}
          <Button
            variant={darkMode ? "default" : "default"}
            size="sm"
            onClick={toggleToolbar}
            className={cn(
              "invisible sm:visible absolute -bottom-11 left-1/2 transform -translate-x-1/2 rounded-full w-12 h-12 p-0",
              "shadow-lg border-2",
              darkMode ? "border-gray-700" : "border-gray-200",
              
            )}
          >
            {showToolbar ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-20">
          {timezones.map((timezone, index) => (
            <div
              key={timezone}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className="cursor-grab active:cursor-grabbing"
            >
              <TimezoneCard
                timezone={timezone}
                label={timezoneLabels[timezone] || timezone.replace(/_/g, " ")}
                currentDateTime={currentDateTime}
                onTimeChange={updateTime}
                onCopy={() => copyTimeToClipboard(timezone)}
                onRemove={() => removeTimezone(timezone)}
                onRename={(label) => renameTimezone(timezone, label)}
                onColorChange={(idx) => updateColor(timezone, idx)}
                compact={compactView}
                isLocal={timezone === userTimezone}
                colorIndex={
                  timezoneColors[timezone] !== undefined
                    ? timezoneColors[timezone]
                    : index
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

