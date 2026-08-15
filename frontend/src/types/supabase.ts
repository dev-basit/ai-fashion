export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      appointment_products: {
        Row: {
          appointment_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          product_id: string;
          quantity: number;
        };
        Insert: {
          appointment_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          product_id: string;
          quantity: number;
        };
        Update: {
          appointment_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          product_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_products_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointment_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          client_id: string;
          consultation_record_id: string | null;
          created_at: string;
          discount: number;
          ends_at: string;
          id: string;
          internal_notes: string | null;
          notes: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          price: number;
          service_id: string;
          service_variant_id: string | null;
          staff_profile_id: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        Insert: {
          client_id: string;
          consultation_record_id?: string | null;
          created_at?: string;
          discount?: number;
          ends_at: string;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          price: number;
          service_id: string;
          service_variant_id?: string | null;
          staff_profile_id?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          consultation_record_id?: string | null;
          created_at?: string;
          discount?: number;
          ends_at?: string;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          price?: number;
          service_id?: string;
          service_variant_id?: string | null;
          staff_profile_id?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_consultation_record_id_fkey";
            columns: ["consultation_record_id"];
            isOneToOne: false;
            referencedRelation: "consultation_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_variant_id_fkey";
            columns: ["service_variant_id"];
            isOneToOne: false;
            referencedRelation: "service_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      business_settings: {
        Row: {
          id: string;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          id?: string;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: Json;
        };
        Update: {
          id?: string;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "business_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_treatment_plans: {
        Row: {
          assigned_by: string | null;
          client_id: string;
          created_at: string;
          ends_on: string | null;
          id: string;
          name: string;
          progress_notes: Json;
          starts_on: string;
          status: Database["public"]["Enums"]["plan_status"];
          template_id: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_by?: string | null;
          client_id: string;
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          name: string;
          progress_notes?: Json;
          starts_on: string;
          status?: Database["public"]["Enums"]["plan_status"];
          template_id?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_by?: string | null;
          client_id?: string;
          created_at?: string;
          ends_on?: string | null;
          id?: string;
          name?: string;
          progress_notes?: Json;
          starts_on?: string;
          status?: Database["public"]["Enums"]["plan_status"];
          template_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_treatment_plans_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_treatment_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_treatment_plans_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "treatment_plan_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      consultation_form_templates: {
        Row: {
          created_at: string;
          description: string | null;
          fields: Json;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          fields?: Json;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          fields?: Json;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consultation_records: {
        Row: {
          appointment_id: string | null;
          client_id: string;
          created_at: string;
          id: string;
          observations: string | null;
          recommendations: string[] | null;
          responses: Json;
          staff_profile_id: string | null;
          submitted_at: string | null;
          template_id: string | null;
          updated_at: string;
        };
        Insert: {
          appointment_id?: string | null;
          client_id: string;
          created_at?: string;
          id?: string;
          observations?: string | null;
          recommendations?: string[] | null;
          responses?: Json;
          staff_profile_id?: string | null;
          submitted_at?: string | null;
          template_id?: string | null;
          updated_at?: string;
        };
        Update: {
          appointment_id?: string | null;
          client_id?: string;
          created_at?: string;
          id?: string;
          observations?: string | null;
          recommendations?: string[] | null;
          responses?: Json;
          staff_profile_id?: string | null;
          submitted_at?: string | null;
          template_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultation_records_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultation_records_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultation_records_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultation_records_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "consultation_form_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          joined_at: string;
          last_read_at: string | null;
          profile_id: string;
        };
        Insert: {
          conversation_id: string;
          joined_at?: string;
          last_read_at?: string | null;
          profile_id: string;
        };
        Update: {
          conversation_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          is_group: boolean;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_group?: boolean;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_group?: boolean;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          edited_at: string | null;
          id: string;
          is_edited: boolean;
          message_type: Database["public"]["Enums"]["message_type"];
          metadata: Json | null;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          edited_at?: string | null;
          id?: string;
          is_edited?: boolean;
          message_type?: Database["public"]["Enums"]["message_type"];
          metadata?: Json | null;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          edited_at?: string | null;
          id?: string;
          is_edited?: boolean;
          message_type?: Database["public"]["Enums"]["message_type"];
          metadata?: Json | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          data: Json | null;
          id: string;
          is_read: boolean;
          profile_id: string;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_read?: boolean;
          profile_id: string;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          body?: string | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_read?: boolean;
          profile_id?: string;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          shipping_address: Json | null;
          status: Database["public"]["Enums"]["order_status"];
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          shipping_address?: Json | null;
          status?: Database["public"]["Enums"]["order_status"];
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          shipping_address?: Json | null;
          status?: Database["public"]["Enums"]["order_status"];
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          cost_price: number | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_for_sale: boolean;
          low_stock_threshold: number;
          name: string;
          price: number;
          sku: string | null;
          stock_quantity: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_for_sale?: boolean;
          low_stock_threshold?: number;
          name: string;
          price: number;
          sku?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_for_sale?: boolean;
          low_stock_threshold?: number;
          name?: string;
          price?: number;
          sku?: string | null;
          stock_quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          date_of_birth: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          notes: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          notes?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      service_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      service_tag_relations: {
        Row: {
          service_id: string;
          tag_id: string;
        };
        Insert: {
          service_id: string;
          tag_id: string;
        };
        Update: {
          service_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_tag_relations_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_tag_relations_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "service_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      service_tags: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      service_variants: {
        Row: {
          created_at: string;
          duration_modifier: number;
          id: string;
          is_active: boolean;
          name: string;
          price_modifier: number;
          service_id: string;
        };
        Insert: {
          created_at?: string;
          duration_modifier?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          price_modifier?: number;
          service_id: string;
        };
        Update: {
          created_at?: string;
          duration_modifier?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_modifier?: number;
          service_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_variants_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          base_price: number;
          category_id: string | null;
          created_at: string;
          description: string | null;
          duration_mins: number;
          id: string;
          image_url: string | null;
          instructions: string | null;
          is_active: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          base_price: number;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_mins: number;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_mins?: number;
          id?: string;
          image_url?: string | null;
          instructions?: string | null;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "service_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_leaves: {
        Row: {
          approved_by: string | null;
          created_at: string;
          ends_at: string;
          id: string;
          reason: string | null;
          staff_profile_id: string;
          starts_at: string;
        };
        Insert: {
          approved_by?: string | null;
          created_at?: string;
          ends_at: string;
          id?: string;
          reason?: string | null;
          staff_profile_id: string;
          starts_at: string;
        };
        Update: {
          approved_by?: string | null;
          created_at?: string;
          ends_at?: string;
          id?: string;
          reason?: string | null;
          staff_profile_id?: string;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_leaves_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_leaves_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_profiles: {
        Row: {
          bio: string | null;
          certifications: string[] | null;
          commission_rate: number | null;
          created_at: string;
          hire_date: string | null;
          hourly_rate: number | null;
          id: string;
          is_available: boolean;
          profile_id: string;
          specializations: string[] | null;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          certifications?: string[] | null;
          commission_rate?: number | null;
          created_at?: string;
          hire_date?: string | null;
          hourly_rate?: number | null;
          id?: string;
          is_available?: boolean;
          profile_id: string;
          specializations?: string[] | null;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          certifications?: string[] | null;
          commission_rate?: number | null;
          created_at?: string;
          hire_date?: string | null;
          hourly_rate?: number | null;
          id?: string;
          is_available?: boolean;
          profile_id?: string;
          specializations?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_schedules: {
        Row: {
          created_at: string;
          day_of_week: number;
          end_time: string;
          id: string;
          is_working: boolean;
          staff_profile_id: string;
          start_time: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          end_time: string;
          id?: string;
          is_working?: boolean;
          staff_profile_id: string;
          start_time: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          is_working?: boolean;
          staff_profile_id?: string;
          start_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_services: {
        Row: {
          service_id: string;
          staff_profile_id: string;
        };
        Insert: {
          service_id: string;
          staff_profile_id: string;
        };
        Update: {
          service_id?: string;
          staff_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_services_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_plan_templates: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          duration_days: number;
          id: string;
          is_active: boolean;
          name: string;
          steps: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          duration_days: number;
          id?: string;
          is_active?: boolean;
          name: string;
          steps?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          duration_days?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          steps?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_plan_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: { Args: never; Returns: boolean };
      is_staff_or_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      appointment_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
      message_type: "text" | "image" | "file" | "system";
      notification_type: "appointment" | "message" | "order" | "system" | "reminder";
      order_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
      payment_status: "unpaid" | "partial" | "paid" | "refunded";
      plan_status: "draft" | "active" | "completed" | "cancelled";
      user_role: "admin" | "staff" | "customer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
      message_type: ["text", "image", "file", "system"],
      notification_type: ["appointment", "message", "order", "system", "reminder"],
      order_status: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
      payment_status: ["unpaid", "partial", "paid", "refunded"],
      plan_status: ["draft", "active", "completed", "cancelled"],
      user_role: ["admin", "staff", "customer"],
    },
  },
} as const;
