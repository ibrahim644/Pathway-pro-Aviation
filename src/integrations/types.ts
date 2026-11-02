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
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          file_name: string
          file_path: string
          id: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          file_name: string
          file_path: string
          id?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          file_name?: string
          file_path?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          address: string | null
          admin_notes: string | null
          application_number: string
          course_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          highest_qualification: string | null
          id: string
          institution_attended: string | null
          nationality: string | null
          personal_statement: string | null
          phone: string | null
          reviewed_at: string | null
          state_of_origin: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
          year_completed: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          application_number?: string
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          highest_qualification?: string | null
          id?: string
          institution_attended?: string | null
          nationality?: string | null
          personal_statement?: string | null
          phone?: string | null
          reviewed_at?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          year_completed?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          application_number?: string
          course_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          highest_qualification?: string | null
          id?: string
          institution_attended?: string | null
          nationality?: string | null
          personal_statement?: string | null
          phone?: string | null
          reviewed_at?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          year_completed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          cta_href: string | null
          cta_label: string | null
          id: string
          image_url: string | null
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      brochures: {
        Row: {
          created_at: string
          description: string
          file_url: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          file_url: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          course_title: string
          created_at: string
          grade: string | null
          graduate_name: string
          graduation_date: string
          id: string
          is_valid: boolean
        }
        Insert: {
          certificate_number: string
          course_title: string
          created_at?: string
          grade?: string | null
          graduate_name: string
          graduation_date: string
          id?: string
          is_valid?: boolean
        }
        Update: {
          certificate_number?: string
          course_title?: string
          created_at?: string
          grade?: string | null
          graduate_name?: string
          graduation_date?: string
          id?: string
          is_valid?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          application_fee: number
          created_at: string
          description: string
          duration: string
          id: string
          image_url: string | null
          is_active: boolean
          requirements: string[]
          slug: string
          sort_order: number
          summary: string
          title: string
          tuition_fee: number
          updated_at: string
        }
        Insert: {
          application_fee?: number
          created_at?: string
          description?: string
          duration?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          requirements?: string[]
          slug: string
          sort_order?: number
          summary?: string
          title: string
          tuition_fee?: number
          updated_at?: string
        }
        Update: {
          application_fee?: number
          created_at?: string
          description?: string
          duration?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          requirements?: string[]
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
          tuition_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      mfa_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author: string | null
          body: string
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          body?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          body?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          gateway: string
          id: string
          paid_at: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          reference: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string
          currency?: string
          gateway?: string
          id?: string
          paid_at?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          reference: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          gateway?: string
          id?: string
          paid_at?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          application_id: string | null
          course_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          session: string | null
          status: string
          student_number: string
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          course_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          session?: string | null
          status?: string
          student_number: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          course_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          session?: string | null
          status?: string
          student_number?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          label: string
          last_used_at: string
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          label?: string
          last_used_at?: string
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          label?: string
          last_used_at?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "staff" | "applicant"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "documents_requested"
        | "approved"
        | "rejected"
      payment_purpose: "application_fee" | "registration_fee" | "tuition"
      payment_status: "pending" | "success" | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "applicant"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "documents_requested",
        "approved",
        "rejected",
      ],
      payment_purpose: ["application_fee", "registration_fee", "tuition"],
      payment_status: ["pending", "success", "failed"],
    },
  },
} as const
