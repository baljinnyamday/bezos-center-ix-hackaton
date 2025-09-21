"use client";

import { Home, Settings, BarChart3, Brain, Database, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const dataItems = [
  {
    title: "Supply Chain",
    url: "/supply-chain",
    icon: BarChart3,
  },
  {
    title: "AI Insights",
    url: "/ai-insights",
    icon: Brain,
  },
  {
    title: "External Data",
    url: "/external-data",
    icon: Database,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-64"}`}>
      <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300`}>
        <SidebarContent>
          {/* Toggle Button integrated into sidebar */}

          <SidebarGroup>
            <div className="flex items-center justify-between p-2 border-b">
              {!isCollapsed && (
                <SidebarGroupLabel className="text-md font-black">AI Supply Dashboard</SidebarGroupLabel>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-accent rounded-md transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className={`${isCollapsed ? "justify-center" : ""}`}>
                        <item.icon />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {!isCollapsed && <SidebarGroupLabel>Data & Analytics</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {dataItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className={`${isCollapsed ? "justify-center" : ""}`}>
                        <item.icon />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
