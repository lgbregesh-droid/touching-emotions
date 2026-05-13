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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_name: string | null
          email: string | null
          id: string
          status: string
          type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          donor_name?: string | null
          email?: string | null
          id?: string
          status?: string
          type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string | null
          email?: string | null
          id?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          created_at: string
          featured: boolean
          id: string
          order_index: number
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          id?: string
          order_index?: number
          storage_path?: string | null
          url?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_name: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          quantity: number
          shipping_status: string
        }
        Insert: {
          amount?: number
          buyer_name: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          quantity?: number
          shipping_status?: string
        }
        Update: {
          amount?: number
          buyer_name?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          quantity?: number
          shipping_status?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          desc_en: string | null
          desc_he: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name_en: string | null
          name_he: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          desc_en?: string | null
          desc_he?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name_en?: string | null
          name_he: string
          price?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          desc_en?: string | null
          desc_he?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name_en?: string | null
          name_he?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string
          value_en: string | null
          value_he: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value_en?: string | null
          value_he?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value_en?: string | null
          value_he?: string | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          created_at: string
          id: string
          interest: string | null
          name: string
          phone: string | null
          profession: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest?: string | null
          name: string
          phone?: string | null
          profession?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          interest?: string | null
          name?: string
          phone?: string | null
          profession?: string | null
          status?: string
        }
        Relationships: []
      }
      workshop_registrants: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          workshop_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          workshop_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrants_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          audience: string | null
          created_at: string
          date: string | null
          desc_en: string | null
          desc_he: string | null
          id: string
          image_url: string | null
          location: string | null
          max_participants: number | null
          name_en: string | null
          name_he: string
          order_index: number
          price: number
          status: string
          time: string | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          date?: string | null
          desc_en?: string | null
          desc_he?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name_en?: string | null
          name_he: string
          order_index?: number
          price?: number
          status?: string
          time?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          date?: string | null
          desc_en?: string | null
          desc_he?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name_en?: string | null
          name_he?: string
          order_index?: number
          price?: number
          status?: string
          time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
