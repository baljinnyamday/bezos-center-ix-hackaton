"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, MapIcon } from "lucide-react";
import { LocationMap } from "@/components/settings/location-map";
import { DataPreferences } from "@/components/settings/data-preferences";
import toast from "react-hot-toast";

interface CompanyLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: "headquarters" | "warehouse" | "factory" | "supplier";
}

export default function SettingsPage() {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    type: "warehouse" as CompanyLocation["type"],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch("/api/settings/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.address) {
      toast.error("Missing Information: Please fill in name and address fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLocation,
          latitude: Number.parseFloat(newLocation.latitude) || 0,
          longitude: Number.parseFloat(newLocation.longitude) || 0,
        }),
      });

      if (response.ok) {
        const location = await response.json();
        setLocations([...locations, location]);
        setNewLocation({ name: "", address: "", latitude: "", longitude: "", type: "warehouse" });
        toast.success("Location Added");
      }
    } catch (error) {
      toast.error("Failed to add location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocations(locations.filter((loc) => loc.id !== id));
        toast.success("Location Deleted: Company location has been removed.");
      }
    } catch (error) {
      toast.error("Failed to delete location.");
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setNewLocation((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      address: address || prev.address,
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="locations">Company Locations</TabsTrigger>
          <TabsTrigger value="data">Data Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Interactive Map
              </CardTitle>
              <CardDescription>Click on the map to select a location, or use the manual inputs below</CardDescription>
            </CardHeader>
            <CardContent>
              <LocationMap locations={locations} onLocationSelect={handleMapLocationSelect} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Location</CardTitle>
              <CardDescription>
                Add company locations manually or use the map above to select coordinates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Warehouse"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={newLocation.type}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, type: e.target.value as CompanyLocation["type"] }))
                    }
                  >
                    <option value="headquarters">Headquarters</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="factory">Factory</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                    value={newLocation.latitude}
                    onChange={(e) => setNewLocation((prev) => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                    value={newLocation.longitude}
                    onChange={(e) => setNewLocation((prev) => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleAddLocation} disabled={isLoading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? "Adding..." : "Add Location"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Locations</CardTitle>
              <CardDescription>Manage your company locations</CardDescription>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No locations added yet. Add your first location above.
                </p>
              ) : (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{location.name}</h3>
                          <Badge variant="secondary">{location.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                        {location.latitude && location.longitude && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteLocation(location.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <DataPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}
