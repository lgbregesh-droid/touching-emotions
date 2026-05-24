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
      ai_policies: {
        Row: {
          created_at: string
          id: string
          instruction: string
          is_active: boolean
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instruction: string
          is_active?: boolean
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instruction?: string
          is_active?: boolean
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_submission_analysis: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          ai_status: string | null
          category: string | null
          created_at: string
          draft_reply: string | null
          error_message: string | null
          id: string
          internal_notes: string | null
          main_need: string | null
          matched_workshop_or_lecture: Json | null
          missing_information: Json | null
          model: string | null
          priority: string | null
          rag_context_chars: number
          rag_documents_used: Json
          recommended_next_step: string | null
          sentiment: string | null
          short_summary: string | null
          submission_id: string
          submission_table: string | null
          submission_type: string
          suggested_activity_type: string | null
          suggested_response: string | null
          summary: string | null
          target_audience: string | null
          urgency_level: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          ai_status?: string | null
          category?: string | null
          created_at?: string
          draft_reply?: string | null
          error_message?: string | null
          id?: string
          internal_notes?: string | null
          main_need?: string | null
          matched_workshop_or_lecture?: Json | null
          missing_information?: Json | null
          model?: string | null
          priority?: string | null
          rag_context_chars?: number
          rag_documents_used?: Json
          recommended_next_step?: string | null
          sentiment?: string | null
          short_summary?: string | null
          submission_id: string
          submission_table?: string | null
          submission_type: string
          suggested_activity_type?: string | null
          suggested_response?: string | null
          summary?: string | null
          target_audience?: string | null
          urgency_level?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          ai_status?: string | null
          category?: string | null
          created_at?: string
          draft_reply?: string | null
          error_message?: string | null
          id?: string
          internal_notes?: string | null
          main_need?: string | null
          matched_workshop_or_lecture?: Json | null
          missing_information?: Json | null
          model?: string | null
          priority?: string | null
          rag_context_chars?: number
          rag_documents_used?: Json
          recommended_next_step?: string | null
          sentiment?: string | null
          short_summary?: string | null
          submission_id?: string
          submission_table?: string | null
          submission_type?: string
          suggested_activity_type?: string | null
          suggested_response?: string | null
          summary?: string | null
          target_audience?: string | null
          urgency_level?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          ai_status: string | null
          created_at: string
          email: string | null
          email_status: string | null
          full_name: string | null
          id: string
          inquiry_type: string | null
          message: string
          name: string
          phone: string | null
          source_page: string | null
          status: string
          subject: string | null
        }
        Insert: {
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          full_name?: string | null
          id?: string
          inquiry_type?: string | null
          message: string
          name: string
          phone?: string | null
          source_page?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          full_name?: string | null
          id?: string
          inquiry_type?: string | null
          message?: string
          name?: string
          phone?: string | null
          source_page?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          ai_status: string | null
          amount: number
          created_at: string
          donor_name: string | null
          email: string | null
          email_status: string | null
          id: string
          status: string
          type: string
        }
        Insert: {
          ai_status?: string | null
          amount?: number
          created_at?: string
          donor_name?: string | null
          email?: string | null
          email_status?: string | null
          id?: string
          status?: string
          type?: string
        }
        Update: {
          ai_status?: string | null
          amount?: number
          created_at?: string
          donor_name?: string | null
          email?: string | null
          email_status?: string | null
          id?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          ai_status: string | null
          confirmation_sent: boolean
          created_at: string
          email: string
          email_status: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string
        }
        Insert: {
          ai_status?: string | null
          confirmation_sent?: boolean
          created_at?: string
          email: string
          email_status?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone: string
        }
        Update: {
          ai_status?: string | null
          confirmation_sent?: boolean
          created_at?: string
          email?: string
          email_status?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string
          description_en: string | null
          description_he: string | null
          end_time: string | null
          id: string
          image_url: string | null
          location_en: string | null
          location_he: string | null
          max_spots: number
          online_link: string | null
          price: number
          spots_remaining: number
          status: string
          time: string
          title_en: string | null
          title_he: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description_en?: string | null
          description_he?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          location_en?: string | null
          location_he?: string | null
          max_spots?: number
          online_link?: string | null
          price?: number
          spots_remaining?: number
          status?: string
          time: string
          title_en?: string | null
          title_he: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description_en?: string | null
          description_he?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          location_en?: string | null
          location_he?: string | null
          max_spots?: number
          online_link?: string | null
          price?: number
          spots_remaining?: number
          status?: string
          time?: string
          title_en?: string | null
          title_he?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          alt_text: string | null
          caption: string | null
          category: string
          created_at: string
          featured: boolean
          id: string
          is_active: boolean
          order_index: number
          storage_path: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          is_active?: boolean
          order_index?: number
          storage_path?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          featured?: boolean
          id?: string
          is_active?: boolean
          order_index?: number
          storage_path?: string | null
          url?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          integration_type: string
          metadata: Json
          status: string
          submission_id: string | null
          submission_table: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type: string
          metadata?: Json
          status: string
          submission_id?: string | null
          submission_table?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type?: string
          metadata?: Json
          status?: string
          submission_id?: string | null
          submission_table?: string | null
        }
        Relationships: []
      }
      lectures: {
        Row: {
          created_at: string
          duration: string | null
          full_description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          order_index: number
          short_description: string | null
          target_audience: string | null
          title: string
          topics: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          short_description?: string | null
          target_audience?: string | null
          title: string
          topics?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          short_description?: string | null
          target_audience?: string | null
          title?: string
          topics?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          category: string | null
          created_at: string
          id: string
          page: string | null
          section: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          page?: string | null
          section?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          page?: string | null
          section?: string | null
          url?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          ai_status: string | null
          amount: number
          buyer_name: string
          created_at: string
          email: string | null
          email_status: string | null
          id: string
          phone: string | null
          quantity: number
          shipping_status: string
        }
        Insert: {
          ai_status?: string | null
          amount?: number
          buyer_name: string
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          phone?: string | null
          quantity?: number
          shipping_status?: string
        }
        Update: {
          ai_status?: string | null
          amount?: number
          buyer_name?: string
          created_at?: string
          email?: string | null
          email_status?: string | null
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
      rag_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding: string
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          category: string
          chars_total: number
          created_at: string
          description: string | null
          extraction_error: string | null
          extraction_status: string
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          is_active: boolean
          language: string
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          chars_total?: number
          created_at?: string
          description?: string | null
          extraction_error?: string | null
          extraction_status?: string
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          language?: string
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          chars_total?: number
          created_at?: string
          description?: string | null
          extraction_error?: string | null
          extraction_status?: string
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          language?: string
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          label: string | null
          page: string | null
          section: string | null
          type: string
          updated_at: string
          value_en: string | null
          value_he: string | null
        }
        Insert: {
          id?: string
          key: string
          label?: string | null
          page?: string | null
          section?: string | null
          type?: string
          updated_at?: string
          value_en?: string | null
          value_he?: string | null
        }
        Update: {
          id?: string
          key?: string
          label?: string | null
          page?: string | null
          section?: string | null
          type?: string
          updated_at?: string
          value_en?: string | null
          value_he?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          label: string | null
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          label?: string | null
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          label?: string | null
          type?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      support_items: {
        Row: {
          contact_link: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          order_index: number
          price: string | null
          title: string
          updated_at: string
        }
        Insert: {
          contact_link?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          price?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          contact_link?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          price?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          order_index: number
          role: string | null
          text: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          order_index?: number
          role?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          order_index?: number
          role?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          age: string | null
          ai_status: string | null
          created_at: string
          email: string | null
          email_status: string | null
          id: string
          interest: string | null
          interests: string | null
          location: string | null
          message: string | null
          name: string
          phone: string | null
          profession: string | null
          status: string
        }
        Insert: {
          age?: string | null
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          interest?: string | null
          interests?: string | null
          location?: string | null
          message?: string | null
          name: string
          phone?: string | null
          profession?: string | null
          status?: string
        }
        Update: {
          age?: string | null
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          interest?: string | null
          interests?: string | null
          location?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          profession?: string | null
          status?: string
        }
        Relationships: []
      }
      workshop_registrants: {
        Row: {
          ai_status: string | null
          created_at: string
          email: string | null
          email_status: string | null
          id: string
          name: string
          phone: string | null
          workshop_id: string
        }
        Insert: {
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          id?: string
          name: string
          phone?: string | null
          workshop_id: string
        }
        Update: {
          ai_status?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
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
          age_group: string | null
          audience: string | null
          created_at: string
          date: string | null
          desc_en: string | null
          desc_he: string | null
          format: string | null
          full_description: string | null
          goals: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          location: string | null
          max_participants: number | null
          name_en: string | null
          name_he: string
          order_index: number
          price: number
          short_description: string | null
          status: string
          target_audience: string | null
          time: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          audience?: string | null
          created_at?: string
          date?: string | null
          desc_en?: string | null
          desc_he?: string | null
          format?: string | null
          full_description?: string | null
          goals?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          location?: string | null
          max_participants?: number | null
          name_en?: string | null
          name_he: string
          order_index?: number
          price?: number
          short_description?: string | null
          status?: string
          target_audience?: string | null
          time?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          audience?: string | null
          created_at?: string
          date?: string | null
          desc_en?: string | null
          desc_he?: string | null
          format?: string | null
          full_description?: string | null
          goals?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          location?: string | null
          max_participants?: number | null
          name_en?: string | null
          name_he?: string
          order_index?: number
          price?: number
          short_description?: string | null
          status?: string
          target_audience?: string | null
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
      match_rag_chunks: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          chunk_index: number
          content: string
          doc_category: string
          doc_language: string
          doc_title: string
          document_id: string
          similarity: number
        }[]
      }
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
