export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          topic: string | null
          message: string
          source: string
          status: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          topic?: string | null
          message: string
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          topic?: string | null
          message?: string
          source?: string
          status?: 'new' | 'contacted' | 'qualified' | 'closed'
          assigned_to?: string | null
          notes?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          phone: string | null
          stripe_customer_id: string | null
          total_spent: number
          order_count: number
          last_order_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_spent?: number
          order_count?: number
          last_order_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_spent?: number
          order_count?: number
          last_order_at?: string | null
          metadata?: Json | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          stripe_session_id: string
          customer_name: string
          customer_email: string
          package_type: string
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_session_id: string
          customer_name: string
          customer_email: string
          package_type: string
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          stripe_session_id?: string
          customer_name?: string
          customer_email?: string
          package_type?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          fulfillment_status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          delivered_at?: string | null
          metadata?: Json | null
        }
      }
      webhook_logs: {
        Row: {
          id: string
          created_at: string
          event_id: string
          event_type: string
          processed: boolean
          error_message: string | null
          payload: Json
          processed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          event_type: string
          processed?: boolean
          error_message?: string | null
          payload: Json
          processed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          processed?: boolean
          error_message?: string | null
          payload?: Json
          processed_at?: string | null
        }
      }
      email_logs: {
        Row: {
          id: string
          created_at: string
          recipient: string
          subject: string
          template: string
          status: 'sent' | 'failed' | 'pending'
          error_message: string | null
          sent_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          recipient: string
          subject: string
          template: string
          status?: 'sent' | 'failed' | 'pending'
          error_message?: string | null
          sent_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          recipient?: string
          subject?: string
          template?: string
          status?: 'sent' | 'failed' | 'pending'
          error_message?: string | null
          sent_at?: string | null
          metadata?: Json | null
        }
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