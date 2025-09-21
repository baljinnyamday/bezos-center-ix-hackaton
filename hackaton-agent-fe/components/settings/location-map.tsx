"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface CompanyLocation {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  type: "headquarters" | "warehouse" | "factory" | "supplier"
}

interface LocationMapProps {
  locations: CompanyLocation[]
  onLocationSelect: (lat: number, lng: number, address: string) => void
}

export function LocationMap({ locations, onLocationSelect }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simple map implementation using a static image with click handling
  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to approximate lat/lng (simplified)
    // This is a basic implementation - in production, you'd use a real map API
    const lat = 40.7128 + (y - rect.height / 2) * -0.01
    const lng = -74.006 + (x - rect.width / 2) * 0.01

    setSelectedLocation({ lat, lng })

    // Simulate reverse geocoding
    const address = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    onLocationSelect(lat, lng, address)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 cursor-crosshair overflow-hidden rounded-lg"
          onClick={handleMapClick}
        >
          {/* Simple map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-100 to-yellow-100">
            <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-blue-500 rounded-full opacity-60"></div>
            <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-green-500 rounded-full opacity-60"></div>
            <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-yellow-500 rounded-full opacity-60"></div>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Existing locations */}
          {locations.map((location, index) => (
            <div
              key={location.id}
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-2 -translate-y-2"
              style={{
                left: `${50 + (location.longitude + 74.006) * 100}%`,
                top: `${50 - (location.latitude - 40.7128) * 100}%`,
              }}
              title={location.name}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {location.name}
              </div>
            </div>
          ))}

          {/* Selected location */}
          {selectedLocation && (
            <div
              className="absolute w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-x-3 -translate-y-3 animate-pulse"
              style={{
                left: `${50 + (selectedLocation.lng + 74.006) * 100}%`,
                top: `${50 - (selectedLocation.lat - 40.7128) * 100}%`,
              }}
            />
          )}

          {/* Instructions */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
            Click anywhere on the map to select a location
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
