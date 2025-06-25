export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      hosting_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          plan_type: string
          regular_price: number
          setup_fee: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan_type: string
          regular_price: number
          setup_fee: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan_type?: string
          regular_price?: number
          setup_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      plan_discounts: {
        Row: {
          billing_cycle: string
          discount_pct: number
          id: string
          plan_id: string
        }
        Insert: {
          billing_cycle: string
          discount_pct: number
          id?: string
          plan_id: string
        }
        Update: {
          billing_cycle?: string
          discount_pct?: number
          id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_discounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hosting_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_upgrades: {
        Row: {
          agent_id: string
          date: string
          from_plan_id: string
          id: string
          mrr_diff: number | null
          notes: string | null
          order_link: string | null
          tcv_diff: number | null
          to_plan_id: string
        }
        Insert: {
          agent_id: string
          date?: string
          from_plan_id: string
          id?: string
          mrr_diff?: number | null
          notes?: string | null
          order_link?: string | null
          tcv_diff?: number | null
          to_plan_id: string
        }
        Update: {
          agent_id?: string
          date?: string
          from_plan_id?: string
          id?: string
          mrr_diff?: number | null
          notes?: string | null
          order_link?: string | null
          tcv_diff?: number | null
          to_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_upgrades_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_upgrades_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "hosting_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_upgrades_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "hosting_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_entries: {
        Row: {
          agent_id: string
          billing_cycle: string
          date: string
          discount_pct: number
          id: string
          mrr: number | null
          order_link: string | null
          plan_id: string
          subscribers_count: number
          tcv: number | null
        }
        Insert: {
          agent_id: string
          billing_cycle: string
          date?: string
          discount_pct: number
          id?: string
          mrr?: number | null
          order_link?: string | null
          plan_id: string
          subscribers_count: number
          tcv?: number | null
        }
        Update: {
          agent_id?: string
          billing_cycle?: string
          date?: string
          discount_pct?: number
          id?: string
          mrr?: number | null
          order_link?: string | null
          plan_id?: string
          subscribers_count?: number
          tcv?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_entries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_entries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "hosting_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          supervisor_id: string | null
        }
        Insert: {
          id?: string
          name: string
          supervisor_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          supervisor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["app_user_role"]
          team_id: string | null
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_user_role"]
          team_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_user_role"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_user_role: "agent" | "supervisor" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_user_role: ["agent", "supervisor", "manager"],
    },
  },
} as const
