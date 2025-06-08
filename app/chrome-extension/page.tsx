import ChromeExtensionGuide from "@/chrome-extension-guide"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chrome Extension - Timezone App",
  description: "Guide for installing the Timezone App Chrome Extension.",
}

export default function ChromeExtensionPage() {
  return <ChromeExtensionGuide />
}

