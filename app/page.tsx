"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
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
    <>
      <Head>
        <title>Timezone App</title>
        <meta
          name="description"
          content="A modern timezone application for developers and remote employees to manage multiple timezones."
        />
      </Head>
      <div
        className={cn(
          "min-h-screen p-4 md:p-8 md:pb-24 transition-colors relative overflow-hidden",
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100"
            : "bg-gradient-to-br from-rose-50 via-slate-50 to-sky-100 text-gray-900",
        )}
      >
        {/* Rich Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div
            className={cn(
              "absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl",
              darkMode
                ? "bg-gradient-to-br from-violet-600 to-indigo-800 opacity-30"
                : "bg-gradient-to-br from-orange-300 to-rose-400 opacity-40"
            )}
          />
          <div
            className={cn(
              "absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full blur-3xl",
              darkMode
                ? "bg-gradient-to-br from-cyan-600 to-blue-800 opacity-25"
                : "bg-gradient-to-br from-violet-300 to-purple-400 opacity-35"
            )}
          />
          <div
            className={cn(
              "absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-3xl",
              darkMode
                ? "bg-gradient-to-br from-purple-600 to-pink-700 opacity-20"
                : "bg-gradient-to-br from-sky-300 to-cyan-400 opacity-40"
            )}
          />
          <div
            className={cn(
              "absolute -bottom-20 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl",
              darkMode
                ? "bg-gradient-to-br from-emerald-700 to-teal-800 opacity-25"
                : "bg-gradient-to-br from-emerald-200 to-teal-300 opacity-50"
            )}
          />
          <div
            className={cn(
              "absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full blur-3xl",
              darkMode
                ? "bg-gradient-to-br from-rose-700 to-orange-800 opacity-15"
                : "bg-gradient-to-br from-amber-200 to-yellow-300 opacity-45"
            )}
          />
          
          {/* Subtle Grid Pattern */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.015]",
              darkMode ? "opacity-[0.03]" : "opacity-[0.02]"
            )}
            style={{
              backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
          
          {/* Noise Texture Overlay */}
          <div
            className={cn(
              "absolute inset-0",
              darkMode ? "opacity-[0.15]" : "opacity-[0.08]"
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      <div className="max-w-7xl mx-auto relative z-[1]">
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
        <div className="fixed bottom-0 left-0 w-full sm:w-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 z-10 p-2">
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              showToolbar ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none",
            )}
          >
            <div
              className={cn(
                "relative flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-3 sm:p-4 sm:rounded-2xl",
                "backdrop-blur-xl border-t sm:border",
                darkMode
                  ? "bg-slate-900/70 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
                  : "bg-white/80 border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.15),0_0_80px_rgba(255,255,255,0.6)_inset]"
              )}
            >
              {/* Subtle inner glow */}
              <div
                className={cn(
                  "absolute inset-0 sm:rounded-2xl opacity-50 pointer-events-none",
                  darkMode
                    ? "bg-gradient-to-t from-transparent via-transparent to-white/5"
                    : "bg-gradient-to-t from-transparent via-transparent to-white/80"
                )}
              />
              
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "relative w-[220px] md:w-[300px] justify-between rounded-xl h-11 transition-all duration-200",
                      darkMode
                        ? "bg-slate-800/60 border-white/10 hover:bg-slate-700/60 hover:border-white/20"
                        : "bg-white/60 border-slate-200/80 hover:bg-white/80 hover:border-slate-300"
                    )}
                  >
                    <span className="truncate">
                      {selectedTimezone ? selectedTimezone.replace(/_/g, " ") : "Search timezones..."}
                    </span>
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
                                setPopoverOpen(false)
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
                size="icon"
                className={cn(
                  "relative rounded-xl h-11 w-11 transition-all duration-200",
                  darkMode
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white",
                  "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
              >
                <Plus className="h-5 w-5" />
              </Button>

              <div className={cn(
                "hidden sm:block w-px h-8 mx-1",
                darkMode ? "bg-white/10" : "bg-slate-200"
              )} />

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    "relative rounded-xl h-11 w-11 transition-all duration-200",
                    darkMode
                      ? "hover:bg-white/10 text-amber-400 hover:text-amber-300"
                      : "hover:bg-slate-100 text-slate-600 hover:text-violet-600"
                  )}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetTime}
                  className={cn(
                    "relative rounded-xl h-11 w-11 transition-all duration-200",
                    darkMode
                      ? "hover:bg-white/10 text-slate-400 hover:text-emerald-400"
                      : "hover:bg-slate-100 text-slate-600 hover:text-emerald-600"
                  )}
                  aria-label="Reset to current time"
                >
                  <RefreshCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCompactView(!compactView)}
                  className={cn(
                    "relative rounded-xl h-11 w-11 transition-all duration-200",
                    darkMode
                      ? "hover:bg-white/10 text-slate-400 hover:text-cyan-400"
                      : "hover:bg-slate-100 text-slate-600 hover:text-cyan-600"
                  )}
                  aria-label="Toggle view"
                >
                  {compactView ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Improved Toggle button for toolbar */}
          {/* <Button
            variant={darkMode ? "default" : "default"}
            size="sm"
            onClick={toggleToolbar}
            className={cn(
              "absolute -top-12 right-4 sm:-bottom-11 sm:left-1/2 sm:-translate-x-1/2 rounded-full w-12 h-12 p-0",
              "shadow-lg border-2",
              darkMode ? "border-gray-700" : "border-gray-200",

            )}
          >
            {showToolbar ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 pb-32">
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
    </>
  )
}

