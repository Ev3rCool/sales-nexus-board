
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bshvrediyfryqhdwpasy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzaHZyZWRpeWZyeXFoZHdhc3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTEzMzYyMCwiZXhwIjoyMDUwNzA5NjIwfQ.12I6q-2Y7oge66JJKnjTsBB9Esfd2rUaaCv91obnWWk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Enums: {
      roles: 'agent' | 'supervisor' | 'manager'
    }
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: Database['public']['Enums']['roles']
          team_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: Database['public']['Enums']['roles']
          team_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: Database['public']['Enums']['roles']
          team_id?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          supervisor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          supervisor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          supervisor_id?: string | null
          created_at?: string
        }
      }
      hosting_plans: {
        Row: {
          id: string
          name: string
          plan_type: string
          regular_price: number
          setup_fee: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan_type: string
          regular_price: number
          setup_fee: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan_type?: string
          regular_price?: number
          setup_fee?: number
          created_at?: string
          updated_at?: string
        }
      }
      plan_discounts: {
        Row: {
          id: string
          plan_id: string
          billing_cycle: string
          discount_pct: number
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          billing_cycle: string
          discount_pct: number
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          billing_cycle?: string
          discount_pct?: number
          created_at?: string
        }
      }
      sales_entries: {
        Row: {
          id: string
          agent_id: string
          plan_id: string
          date: string
          billing_cycle: string
          discount_pct: number
          subscribers_count: number
          order_link: string | null
          mrr: number
          tcv: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          plan_id: string
          date: string
          billing_cycle: string
          discount_pct: number
          subscribers_count: number
          order_link?: string | null
          mrr: number
          tcv: number
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          plan_id?: string
          date?: string
          billing_cycle?: string
          discount_pct?: number
          subscribers_count?: number
          order_link?: string | null
          mrr?: number
          tcv?: number
          created_at?: string
        }
      }
      plan_upgrades: {
        Row: {
          id: string
          agent_id: string
          from_plan_id: string
          to_plan_id: string
          date: string
          order_link: string | null
          notes: string | null
          mrr_diff: number
          tcv_diff: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          from_plan_id: string
          to_plan_id: string
          date: string
          order_link?: string | null
          notes?: string | null
          mrr_diff: number
          tcv_diff: number
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          from_plan_id?: string
          to_plan_id?: string
          date?: string
          order_link?: string | null
          notes?: string | null
          mrr_diff?: number
          tcv_diff?: number
          created_at?: string
        }
      }
    }
  }
}
