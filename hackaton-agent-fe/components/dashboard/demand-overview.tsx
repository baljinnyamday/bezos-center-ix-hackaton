import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock, Package, TrendingUp } from "lucide-react"

export function DemandOverview() {
  const metrics = [
    {
      title: "Active Orders",
      value: "24",
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Companies",
      value: "3",
      change: "Stable",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Urgent Orders",
      value: "8",
      change: "+3",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Fulfillment Rate",
      value: "96.8%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <>
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant={metric.change.includes("+") ? "default" : "secondary"} className="text-xs">
                  {metric.change}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
