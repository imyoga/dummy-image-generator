"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon } from "lucide-react"

const PRESET_RESOLUTIONS = [
  { label: "HD (1280×720)", width: 1280, height: 720 },
  { label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { label: "4K (3840×2160)", width: 3840, height: 2160 },
  { label: "Square (1080×1080)", width: 1080, height: 1080 },
  { label: "Portrait (1080×1350)", width: 1080, height: 1350 },
  { label: "Story (1080×1920)", width: 1080, height: 1920 },
  { label: "Custom", width: 800, height: 600 },
]

const ASPECT_RATIOS = [
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "1:1", ratio: 1 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "Custom", ratio: null },
]

const TEXT_POSITIONS = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Center Left", value: "center-left" },
  { label: "Center", value: "center" },
  { label: "Center Right", value: "center-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
]

const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  const ratioW = width / divisor
  const ratioH = height / divisor

  // Check if it matches common ratios
  const commonRatios = [
    { ratio: 16 / 9, label: "16:9" },
    { ratio: 4 / 3, label: "4:3" },
    { ratio: 1 / 1, label: "1:1" },
    { ratio: 3 / 4, label: "3:4" },
    { ratio: 9 / 16, label: "9:16" },
  ]

  const currentRatio = width / height
  const matchingRatio = commonRatios.find((r) => Math.abs(r.ratio - currentRatio) < 0.01)

  if (matchingRatio) {
    return matchingRatio.label
  }

  return `${ratioW}:${ratioH}`
}

export default function Component() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [selectedResolution, setSelectedResolution] = useState("Custom")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("Custom")
  const [overlayText, setOverlayText] = useState("Sample Text")
  const [textPosition, setTextPosition] = useState("center")
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0")
  const [currentAspectRatio, setCurrentAspectRatio] = useState("4:3")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const updateDimensions = (newWidth: number, newHeight: number) => {
    setWidth(newWidth)
    setHeight(newHeight)
    // Update current aspect ratio display
    const newRatio = calculateAspectRatio(newWidth, newHeight)
    setCurrentAspectRatio(newRatio)
  }

  const handleResolutionChange = (value: string) => {
    setSelectedResolution(value)
    const preset = PRESET_RESOLUTIONS.find((r) => r.label === value)
    if (preset) {
      updateDimensions(preset.width, preset.height)
      // Update aspect ratio to match the preset
      const newRatio = calculateAspectRatio(preset.width, preset.height)
      setCurrentAspectRatio(newRatio)
      // Find matching aspect ratio in the list
      const matchingAspectRatio = ASPECT_RATIOS.find((r) => r.label === newRatio)
      setSelectedAspectRatio(matchingAspectRatio ? matchingAspectRatio.label : "Custom")
    }
  }

  const handleAspectRatioChange = (value: string) => {
    setSelectedAspectRatio(value)
    setSelectedResolution("Custom") // Always set to custom when aspect ratio changes

    const aspectRatio = ASPECT_RATIOS.find((r) => r.label === value)
    if (aspectRatio && aspectRatio.ratio) {
      const newHeight = Math.round(width / aspectRatio.ratio)
      updateDimensions(width, newHeight)
      setCurrentAspectRatio(value)
    }
  }

  const drawImage = (canvas: HTMLCanvasElement, scale = 1) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scaledWidth = width * scale
    const scaledHeight = height * scale

    canvas.width = scaledWidth
    canvas.height = scaledHeight

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, scaledWidth, scaledHeight)

    // Draw grid pattern
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1
    const gridSize = 50 * scale

    for (let x = 0; x <= scaledWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, scaledHeight)
      ctx.stroke()
    }

    for (let y = 0; y <= scaledHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(scaledWidth, y)
      ctx.stroke()
    }

    // Draw dimensions text
    ctx.fillStyle = "#666"
    ctx.font = `${Math.max(16 * scale, 12)}px Arial`
    ctx.textAlign = "center"
    const dimensionText = `${width} × ${height}`
    ctx.fillText(dimensionText, scaledWidth / 2, scaledHeight / 2 - 20 * scale)

    // Draw overlay text if provided
    if (overlayText.trim()) {
      ctx.fillStyle = "#333"
      ctx.font = `bold ${Math.max(24 * scale, 16)}px Arial`

      let textX = scaledWidth / 2
      let textY = scaledHeight / 2 + 20 * scale

      // Position text based on selection
      switch (textPosition) {
        case "top-left":
          ctx.textAlign = "left"
          textX = 20 * scale
          textY = 40 * scale
          break
        case "top-center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = 40 * scale
          break
        case "top-right":
          ctx.textAlign = "right"
          textX = scaledWidth - 20 * scale
          textY = 40 * scale
          break
        case "center-left":
          ctx.textAlign = "left"
          textX = 20 * scale
          textY = scaledHeight / 2
          break
        case "center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = scaledHeight / 2 + 20 * scale
          break
        case "center-right":
          ctx.textAlign = "right"
          textX = scaledWidth - 20 * scale
          textY = scaledHeight / 2
          break
        case "bottom-left":
          ctx.textAlign = "left"
          textX = 20 * scale
          textY = scaledHeight - 20 * scale
          break
        case "bottom-center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = scaledHeight - 20 * scale
          break
        case "bottom-right":
          ctx.textAlign = "right"
          textX = scaledWidth - 20 * scale
          textY = scaledHeight - 20 * scale
          break
      }

      ctx.fillText(overlayText, textX, textY)
    }
  }

  useEffect(() => {
    if (previewCanvasRef.current) {
      // Calculate scale to fit preview (max 400px width)
      const maxPreviewWidth = 400
      const scale = Math.min(maxPreviewWidth / width, maxPreviewWidth / height, 1)
      drawImage(previewCanvasRef.current, scale)
    }
  }, [width, height, overlayText, textPosition, backgroundColor])

  useEffect(() => {
    // Set initial aspect ratio
    const initialRatio = calculateAspectRatio(width, height)
    setCurrentAspectRatio(initialRatio)
  }, [])

  const downloadImage = () => {
    if (!canvasRef.current) return

    drawImage(canvasRef.current, 1)

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `image_${width}_${height}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }, "image/png")
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dummy Image Generator</h1>
        <p className="text-muted-foreground">Generate and download custom dummy images with text overlays</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resolution">Preset Resolution</Label>
                  <Select value={selectedResolution} onValueChange={handleResolutionChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_RESOLUTIONS.map((preset) => (
                        <SelectItem key={preset.label} value={preset.label}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={selectedAspectRatio} onValueChange={handleAspectRatioChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.label} value={ratio.label}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground mt-1">
                    Current: {currentAspectRatio} ({(width / height).toFixed(2)})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => {
                      const newWidth = Number.parseInt(e.target.value) || 1
                      updateDimensions(newWidth, height)
                      setSelectedResolution("Custom")
                      setSelectedAspectRatio("Custom")
                    }}
                    min="1"
                    max="8000"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => {
                      const newHeight = Number.parseInt(e.target.value) || 1
                      updateDimensions(width, newHeight)
                      setSelectedResolution("Custom")
                      setSelectedAspectRatio("Custom")
                    }}
                    min="1"
                    max="8000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#f0f0f0"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text Overlay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="overlay-text">Overlay Text</Label>
                <Input
                  id="overlay-text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Enter text to display on image"
                />
              </div>

              <div>
                <Label htmlFor="text-position">Text Position</Label>
                <Select value={textPosition} onValueChange={setTextPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dimensions: {width} × {height} pixels
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white flex items-center justify-center min-h-[300px]">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[400px] border rounded shadow-sm"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "400px",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <Button onClick={downloadImage} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download PNG (image_{width}_{height}.png)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for full-size generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}
