export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
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
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          discount_pct: number
          id: string
          plan_id: string
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          discount_pct: number
          id?: string
          plan_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
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
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
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
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
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
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
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
          avatar_url: string | null
          country: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          role: Database["public"]["Enums"]["app_user_role"]
          team_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_user_role"]
          team_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
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
      get_avatar_url: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_user_role"]
      }
      get_user_team_id: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_user_role: "agent" | "supervisor" | "manager"
      billing_cycle: "monthly" | "quarterly" | "semi-annual" | "annual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_user_role: ["agent", "supervisor", "manager"],
      billing_cycle: ["monthly", "quarterly", "semi-annual", "annual"],
    },
  },
} as const
