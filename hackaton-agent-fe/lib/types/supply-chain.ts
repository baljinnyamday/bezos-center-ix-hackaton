export interface Company {
  id: string
  name: string
  contact_email?: string
  priority_level: number
  created_at: string
  updated_at: string
}

export interface DemandOrder {
  id: string
  company_id: string
  product_name: string
  quantity_requested: number
  urgency_level: number
  due_date?: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  company?: Company
}

export interface ProductionMetric {
  id: string
  production_line: string
  current_rate: number
  target_rate: number
  efficiency_percentage?: number
  status: "active" | "maintenance" | "offline"
  recorded_at: string
}

export interface SupplyAllocation {
  id: string
  demand_order_id: string
  allocated_quantity: number
  production_line: string
  priority_score?: number
  allocation_reason?: string
  weather_factor: number
  market_factor: number
  news_sentiment_factor: number
  created_at: string
  demand_order?: DemandOrder
}

export interface ExternalDataCache {
  id: string
  data_type: "weather" | "news" | "trading" | "market"
  data_content: any
  relevance_score?: number
  expires_at?: string
  created_at: string
}

export interface AIDecision {
  id: string
  decision_type: "allocation" | "priority_adjustment" | "production_recommendation"
  input_data: any
  output_data: any
  confidence_score?: number
  reasoning?: string
  created_at: string
}
