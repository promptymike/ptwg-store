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
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          note: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          note?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          note?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          body: string
          created_at: string
          description: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          created_at: string
          download_count: number
          id: string
          last_downloaded_at: string | null
          order_id: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          id?: string
          last_downloaded_at?: string | null
          order_id?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          id?: string
          last_downloaded_at?: string | null
          order_id?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          email: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          email: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          email?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_previews: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_previews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accent: string
          badge: string | null
          bestseller: boolean
          category_id: string
          compare_at_price: number | null
          cover_gradient: string
          cover_path: string | null
          created_at: string
          description: string
          featured: boolean
          featured_order: number
          file_path: string | null
          format: string
          hero_note: string
          id: string
          includes: string[]
          is_active: boolean
          name: string
          pages: number
          price: number
          rating: number
          sales_label: string
          short_description: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          accent?: string
          badge?: string | null
          bestseller?: boolean
          category_id: string
          compare_at_price?: number | null
          cover_gradient?: string
          cover_path?: string | null
          created_at?: string
          description: string
          featured?: boolean
          featured_order?: number
          file_path?: string | null
          format: string
          hero_note?: string
          id?: string
          includes?: string[]
          is_active?: boolean
          name: string
          pages?: number
          price: number
          rating?: number
          sales_label?: string
          short_description: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          accent?: string
          badge?: string | null
          bestseller?: boolean
          category_id?: string
          compare_at_price?: number | null
          cover_gradient?: string
          cover_path?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          featured_order?: number
          file_path?: string | null
          format?: string
          hero_note?: string
          id?: string
          includes?: string[]
          is_active?: boolean
          name?: string
          pages?: number
          price?: number
          rating?: number
          sales_label?: string
          short_description?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          body: string
          created_at: string
          cta_href: string | null
          cta_label: string | null
          description: string
          eyebrow: string
          id: string
          is_published: boolean
          section_key: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          description?: string
          eyebrow?: string
          id?: string
          is_published?: boolean
          section_key: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          description?: string
          eyebrow?: string
          id?: string
          is_published?: boolean
          section_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          checkout_session_id: string
          created_at: string
          event_type: string
          id: string
        }
        Insert: {
          checkout_session_id: string
          created_at?: string
          event_type: string
          id: string
        }
        Update: {
          checkout_session_id?: string
          created_at?: string
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          created_at: string
          id: string
          is_published: boolean
          quote: string
          role: string
          score: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote: string
          role?: string
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote?: string
          role?: string
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      order_status: "new" | "paid" | "fulfilled" | "cancelled"
      product_status: "draft" | "published" | "archived"
      user_role: "admin" | "user"
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
      order_status: ["new", "paid", "fulfilled", "cancelled"],
      product_status: ["draft", "published", "archived"],
      user_role: ["admin", "user"],
    },
  },
} as const
