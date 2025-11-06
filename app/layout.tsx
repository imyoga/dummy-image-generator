import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dummy Image Generator',
  description: 'Create beautiful placeholder images with modern gradients, patterns, and custom text. Professional dummy image generator with customizable colors, fonts, and styles.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
