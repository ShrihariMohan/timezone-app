"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ChromeExtensionGuide() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Converting to a Chrome Extension</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This guide explains how to convert the Timezone Converter app into a Chrome extension.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="structure">Project Structure</TabsTrigger>
          <TabsTrigger value="manifest">Manifest File</TabsTrigger>
          <TabsTrigger value="build">Build Process</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Converting Next.js to Chrome Extension</CardTitle>
              <CardDescription>
                Chrome extensions have a different architecture than Next.js apps, but it's possible to convert this
                app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>To convert this Next.js application to a Chrome extension, you'll need to:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create a static build of your Next.js app</li>
                <li>Create a manifest.json file for Chrome</li>
                <li>Adjust the app to work without server-side features</li>
                <li>Package the extension for Chrome Web Store</li>
              </ol>
              <p>
                The good news is that this timezone app is mostly client-side already, making it a good candidate for
                conversion.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Chrome Extension Structure</CardTitle>
              <CardDescription>How to organize your files for a Chrome extension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>A basic Chrome extension structure would look like:</p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {`extension/
├── manifest.json
├── icon-16.png
├── icon-48.png
├── icon-128.png
├── popup/
│   ├── index.html
│   ├── index.js
│   └── styles.css
└── background.js (optional)`}
              </pre>
              <p>For this timezone app, you would:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create a static export of your Next.js app</li>
                <li>Move the exported files to the popup directory</li>
                <li>Adjust paths in HTML/JS files to be relative</li>
                <li>Create a simple manifest.json file</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manifest">
          <Card>
            <CardHeader>
              <CardTitle>Manifest.json File</CardTitle>
              <CardDescription>The configuration file for Chrome extensions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Here's a sample manifest.json file for your timezone extension:</p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {`{
  "manifest_version": 3,
  "name": "Timezone Converter",
  "version": "1.0",
  "description": "Convert and manage multiple timezones",
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  },
  "action": {
    "default_popup": "popup/index.html",
    "default_icon": {
      "16": "icon-16.png",
      "48": "icon-48.png",
      "128": "icon-128.png"
    }
  },
  "permissions": [
    "storage"
  ]
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build">
          <Card>
            <CardHeader>
              <CardTitle>Build Process</CardTitle>
              <CardDescription>Steps to build and package your extension</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Modify Next.js Config</h3>
              <p>First, update your next.config.mjs to enable static exports:</p>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {`// next.config.mjs
export default {
  output: 'export',
  // Disable image optimization since it requires server components
  images: { unoptimized: true }
}`}
              </pre>

              <h3 className="text-lg font-medium">Step 2: Build the App</h3>
              <pre className="bg-muted p-4 rounded-md">npm run build</pre>

              <h3 className="text-lg font-medium">Step 3: Create Extension Structure</h3>
              <p>Create a new directory for your extension and copy files:</p>
              <pre className="bg-muted p-4 rounded-md">
                {`mkdir -p extension/popup
cp -r out/* extension/popup/
# Create manifest.json and icons in the extension directory`}
              </pre>

              <h3 className="text-lg font-medium">Step 4: Test in Chrome</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open Chrome and go to chrome://extensions/</li>
                <li>Enable "Developer mode"</li>
                <li>Click "Load unpacked" and select your extension directory</li>
                <li>The extension should appear in your toolbar</li>
              </ol>

              <h3 className="text-lg font-medium">Step 5: Package for Distribution</h3>
              <p>
                When ready to distribute, zip the extension directory and upload to the Chrome Web Store Developer
                Dashboard.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

