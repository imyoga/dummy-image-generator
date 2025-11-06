"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon, Type, Palette } from "lucide-react"

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

const IMAGE_STYLES = [
  { label: "Modern Gradient", value: "gradient" },
  { label: "Solid Color", value: "solid" },
  { label: "Geometric Pattern", value: "geometric" },
  { label: "Dots Pattern", value: "dots" },
  { label: "Waves", value: "waves" },
  { label: "Grid", value: "grid" },
]

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
]

const GRADIENT_PRESETS = [
  { name: "Sunset", colors: ["#FF6B6B", "#FFE66D", "#4ECDC4"] },
  { name: "Ocean", colors: ["#667eea", "#764ba2", "#f093fb"] },
  { name: "Forest", colors: ["#11998e", "#38ef7d"] },
  { name: "Purple Dream", colors: ["#a18cd1", "#fbc2eb"] },
  { name: "Fire", colors: ["#f12711", "#f5af19"] },
  { name: "Cool Blues", colors: ["#2193b0", "#6dd5ed"] },
  { name: "Peachy", colors: ["#ed4264", "#ffedbc"] },
  { name: "Mint", colors: ["#00b09b", "#96c93d"] },
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
  const [backgroundColor, setBackgroundColor] = useState("#6366f1")
  const [secondaryColor, setSecondaryColor] = useState("#ec4899")
  const [textColor, setTextColor] = useState("#ffffff")
  const [currentAspectRatio, setCurrentAspectRatio] = useState("4:3")
  const [imageStyle, setImageStyle] = useState("gradient")
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif")
  const [fontSize, setFontSize] = useState(48)
  const [showDimensions, setShowDimensions] = useState(true)
  const [selectedGradient, setSelectedGradient] = useState("Sunset")

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

    // Draw background based on selected style
    switch (imageStyle) {
      case "gradient": {
        const gradient = ctx.createLinearGradient(0, 0, scaledWidth, scaledHeight)
        const selectedPreset = GRADIENT_PRESETS.find((p) => p.name === selectedGradient) || GRADIENT_PRESETS[0]
        
        if (selectedPreset.colors.length === 2) {
          gradient.addColorStop(0, selectedPreset.colors[0])
          gradient.addColorStop(1, selectedPreset.colors[1])
        } else if (selectedPreset.colors.length === 3) {
          gradient.addColorStop(0, selectedPreset.colors[0])
          gradient.addColorStop(0.5, selectedPreset.colors[1])
          gradient.addColorStop(1, selectedPreset.colors[2])
        }
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        break
      }
      case "solid":
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        break
      case "geometric": {
        // Base background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        
        // Draw geometric shapes
        ctx.globalAlpha = 0.1
        const shapes = 15
        for (let i = 0; i < shapes; i++) {
          ctx.fillStyle = secondaryColor
          const size = (Math.random() * 200 + 100) * scale
          const x = Math.random() * scaledWidth
          const y = Math.random() * scaledHeight
          
          if (i % 2 === 0) {
            // Circle
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fill()
          } else {
            // Rectangle
            ctx.fillRect(x, y, size, size)
          }
        }
        ctx.globalAlpha = 1
        break
      }
      case "dots": {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        
        const dotSize = 4 * scale
        const spacing = 30 * scale
        ctx.fillStyle = secondaryColor
        ctx.globalAlpha = 0.3
        
        for (let x = spacing; x < scaledWidth; x += spacing) {
          for (let y = spacing; y < scaledHeight; y += spacing) {
            ctx.beginPath()
            ctx.arc(x, y, dotSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
        break
      }
      case "waves": {
        const gradient = ctx.createLinearGradient(0, 0, 0, scaledHeight)
        gradient.addColorStop(0, backgroundColor)
        gradient.addColorStop(1, secondaryColor)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        
        // Draw wave patterns
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 3 * scale
        const waves = 5
        
        for (let i = 0; i < waves; i++) {
          ctx.beginPath()
          const yOffset = (scaledHeight / waves) * i
          for (let x = 0; x <= scaledWidth; x += 10 * scale) {
            const y = yOffset + Math.sin(x / (50 * scale) + i) * 30 * scale
            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.stroke()
        }
        break
      }
      case "grid": {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        
        // Modern grid with subtle lines
        ctx.strokeStyle = secondaryColor
        ctx.globalAlpha = 0.15
        ctx.lineWidth = 2 * scale
        const gridSize = 60 * scale
        
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
        ctx.globalAlpha = 1
        break
      }
    }

    // Add subtle overlay for depth
    const overlayGradient = ctx.createRadialGradient(
      scaledWidth / 2,
      scaledHeight / 2,
      0,
      scaledWidth / 2,
      scaledHeight / 2,
      Math.max(scaledWidth, scaledHeight) / 1.5
    )
    overlayGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)")
    overlayGradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, 0, scaledWidth, scaledHeight)

    // Draw dimensions text if enabled
    if (showDimensions) {
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.6
      ctx.font = `600 ${Math.max(16 * scale, 12)}px ${fontFamily}`
      ctx.textAlign = "center"
      const dimensionText = `${width} × ${height}px`
      
      // Add text shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10 * scale
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2 * scale
      
      // Position at top center
      ctx.fillText(dimensionText, scaledWidth / 2, 40 * scale)
      
      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.globalAlpha = 1
    }

    // Draw overlay text if provided
    if (overlayText.trim()) {
      ctx.fillStyle = textColor
      ctx.font = `700 ${Math.max(fontSize * scale, 16)}px ${fontFamily}`

      let textX = scaledWidth / 2
      let textY = scaledHeight / 2

      // Position text based on selection
      const padding = 60 * scale
      switch (textPosition) {
        case "top-left":
          ctx.textAlign = "left"
          textX = padding
          textY = showDimensions ? padding + 40 * scale : padding
          break
        case "top-center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = showDimensions ? padding + 40 * scale : padding
          break
        case "top-right":
          ctx.textAlign = "right"
          textX = scaledWidth - padding
          textY = showDimensions ? padding + 40 * scale : padding
          break
        case "center-left":
          ctx.textAlign = "left"
          textX = padding
          textY = scaledHeight / 2
          break
        case "center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = scaledHeight / 2
          break
        case "center-right":
          ctx.textAlign = "right"
          textX = scaledWidth - padding
          textY = scaledHeight / 2
          break
        case "bottom-left":
          ctx.textAlign = "left"
          textX = padding
          textY = scaledHeight - padding
          break
        case "bottom-center":
          ctx.textAlign = "center"
          textX = scaledWidth / 2
          textY = scaledHeight - padding
          break
        case "bottom-right":
          ctx.textAlign = "right"
          textX = scaledWidth - padding
          textY = scaledHeight - padding
          break
      }

      // Add text shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 20 * scale
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4 * scale
      
      // Handle multi-line text
      const lines = overlayText.split("\n")
      const lineHeight = fontSize * scale * 1.2
      const totalHeight = lines.length * lineHeight
      const startY = textY - totalHeight / 2 + lineHeight / 2
      
      lines.forEach((line, index) => {
        ctx.fillText(line, textX, startY + index * lineHeight)
      })
      
      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  useEffect(() => {
    if (previewCanvasRef.current) {
      // Calculate scale to fit preview (max 400px width)
      const maxPreviewWidth = 400
      const scale = Math.min(maxPreviewWidth / width, maxPreviewWidth / height, 1)
      drawImage(previewCanvasRef.current, scale)
    }
  }, [width, height, overlayText, textPosition, backgroundColor, secondaryColor, textColor, imageStyle, fontFamily, fontSize, showDimensions, selectedGradient])

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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
          Dummy Image Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Create beautiful placeholder images with modern gradients, patterns, and custom text
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Dimensions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Dimensions
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

              <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">
                Current: {currentAspectRatio} ratio • {width} × {height}px
              </div>
            </CardContent>
          </Card>

          {/* Style Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Visual Style
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-style">Image Style</Label>
                <Select value={imageStyle} onValueChange={setImageStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {imageStyle === "gradient" && (
                <div>
                  <Label htmlFor="gradient-preset">Gradient Preset</Label>
                  <Select value={selectedGradient} onValueChange={setSelectedGradient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADIENT_PRESETS.map((preset) => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex gap-1">
                    {GRADIENT_PRESETS.find((p) => p.name === selectedGradient)?.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="h-8 flex-1 rounded border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {imageStyle !== "gradient" && (
                <>
                  <div>
                    <Label htmlFor="background-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#6366f1"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {imageStyle !== "solid" && (
                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-16 h-10 p-1 border rounded cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          placeholder="#ec4899"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Text Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Text Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="overlay-text">Text Content</Label>
                <Input
                  id="overlay-text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Enter your text here"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use \n for line breaks
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                  <Input
                    id="font-size"
                    type="range"
                    min="16"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number.parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
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

              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <Label htmlFor="show-dimensions" className="cursor-pointer">
                  Show dimensions label
                </Label>
                <input
                  id="show-dimensions"
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                {width} × {height} pixels • {(width * height / 1000000).toFixed(2)}MP
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-xl p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center min-h-[400px]">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[500px] rounded-lg shadow-2xl"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "500px",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-indigo-950 dark:to-pink-950 border-2">
            <CardContent className="pt-6">
              <Button onClick={downloadImage} className="w-full" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download High-Quality PNG
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Filename: image_{width}_{height}.png
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for full-size generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}
