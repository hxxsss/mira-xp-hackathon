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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          last_activity: string | null
          revoked: boolean | null
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          revoked?: boolean | null
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          revoked?: boolean | null
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          monthly_limit: number
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          monthly_limit: number
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          monthly_limit?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          history: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          history?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          history?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string | null
          creditor: string | null
          due_date: string | null
          id: string
          interest_rate: number | null
          name: string
          notes: string | null
          paid_amount: number
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creditor?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          name: string
          notes?: string | null
          paid_amount?: number
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creditor?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          name?: string
          notes?: string | null
          paid_amount?: number
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_amount: number
          estimated_timeline: string | null
          id: string
          is_active: boolean
          target_date: string | null
          title: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          estimated_timeline?: string | null
          id?: string
          is_active?: boolean
          target_date?: string | null
          title: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          estimated_timeline?: string | null
          id?: string
          is_active?: boolean
          target_date?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_steps: {
        Row: {
          created_at: string | null
          id: string
          options: Json
          question: string
          step_number: number
          subtitle: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          options: Json
          question: string
          step_number: number
          subtitle?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          step_number?: number
          subtitle?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      learning_modules: {
        Row: {
          card_color: string
          content: Json | null
          created_at: string | null
          description: string
          icon: string
          icon_bg: string
          id: string
          number: string
          order_index: number
          points_reward: number | null
          title: string
          track_id: string | null
          xp_reward: number | null
        }
        Insert: {
          card_color: string
          content?: Json | null
          created_at?: string | null
          description: string
          icon: string
          icon_bg: string
          id?: string
          number: string
          order_index: number
          points_reward?: number | null
          title: string
          track_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          card_color?: string
          content?: Json | null
          created_at?: string | null
          description?: string
          icon?: string
          icon_bg?: string
          id?: string
          number?: string
          order_index?: number
          points_reward?: number | null
          title?: string
          track_id?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "learning_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_tracks: {
        Row: {
          background_color: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          order_index: number
        }
        Insert: {
          background_color: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          order_index: number
        }
        Update: {
          background_color?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          used: boolean | null
          user_email: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          used?: boolean | null
          user_email: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          used?: boolean | null
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_id: number
          avatar_url: string | null
          created_at: string
          current_xp: number
          dream_points: number
          email: string
          has_completed_tutorial: boolean | null
          id: string
          income_type: string
          monthly_income: number | null
          monthly_savings_goal: number | null
          monthly_xp: number
          name: string
          nickname: string | null
          total_xp: number
          updated_at: string
          weekly_xp: number
        }
        Insert: {
          age?: number | null
          avatar_id?: number
          avatar_url?: string | null
          created_at?: string
          current_xp?: number
          dream_points?: number
          email: string
          has_completed_tutorial?: boolean | null
          id: string
          income_type: string
          monthly_income?: number | null
          monthly_savings_goal?: number | null
          monthly_xp?: number
          name: string
          nickname?: string | null
          total_xp?: number
          updated_at?: string
          weekly_xp?: number
        }
        Update: {
          age?: number | null
          avatar_id?: number
          avatar_url?: string | null
          created_at?: string
          current_xp?: number
          dream_points?: number
          email?: string
          has_completed_tutorial?: boolean | null
          id?: string
          income_type?: string
          monthly_income?: number | null
          monthly_savings_goal?: number | null
          monthly_xp?: number
          name?: string
          nickname?: string | null
          total_xp?: number
          updated_at?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      pvp_group_members: {
        Row: {
          group_id: string
          has_played: boolean
          id: string
          is_ready: boolean | null
          joined_at: string
          score: number
          user_id: string
        }
        Insert: {
          group_id: string
          has_played?: boolean
          id?: string
          is_ready?: boolean | null
          joined_at?: string
          score?: number
          user_id: string
        }
        Update: {
          group_id?: string
          has_played?: boolean
          id?: string
          is_ready?: boolean | null
          joined_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "pvp_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_group_pairings: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          player1_group_id: string
          player1_id: string
          player1_score: number | null
          player2_group_id: string
          player2_id: string
          player2_score: number | null
          round_number: number
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          player1_group_id: string
          player1_id: string
          player1_score?: number | null
          player2_group_id: string
          player2_id: string
          player2_score?: number | null
          round_number?: number
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          player1_group_id?: string
          player1_id?: string
          player1_score?: number | null
          player2_group_id?: string
          player2_id?: string
          player2_score?: number | null
          round_number?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pvp_group_pairings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pvp_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_group_pairings_player1_group_id_fkey"
            columns: ["player1_group_id"]
            isOneToOne: false
            referencedRelation: "pvp_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_group_pairings_player2_group_id_fkey"
            columns: ["player2_group_id"]
            isOneToOne: false
            referencedRelation: "pvp_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_groups: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          leader_user_id: string
          match_id: string
          name: string
          ready_to_start: boolean
          total_score: number
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          leader_user_id: string
          match_id: string
          name: string
          ready_to_start?: boolean
          total_score?: number
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          leader_user_id?: string
          match_id?: string
          name?: string
          ready_to_start?: boolean
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "pvp_groups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pvp_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_match_answers: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean
          match_id: string
          points_earned: number
          question_index: number
          selected_answer: number
          time_taken_seconds: number
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct: boolean
          match_id: string
          points_earned: number
          question_index: number
          selected_answer: number
          time_taken_seconds: number
          user_id: string
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          match_id?: string
          points_earned?: number
          question_index?: number
          selected_answer?: number
          time_taken_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_match_answers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pvp_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_match_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_matches: {
        Row: {
          completed_at: string | null
          countdown_start_at: string | null
          created_at: string | null
          current_round: number | null
          difficulty_level: string | null
          host_ready: boolean | null
          host_score: number | null
          host_user_id: string
          id: string
          match_code: string
          match_mode: string | null
          max_groups: number | null
          module_id: string | null
          opponent_ready: boolean | null
          opponent_score: number | null
          opponent_user_id: string | null
          questions_data: Json
          started_at: string | null
          status: string
          winner_user_id: string | null
          xp_bet: number
        }
        Insert: {
          completed_at?: string | null
          countdown_start_at?: string | null
          created_at?: string | null
          current_round?: number | null
          difficulty_level?: string | null
          host_ready?: boolean | null
          host_score?: number | null
          host_user_id: string
          id?: string
          match_code: string
          match_mode?: string | null
          max_groups?: number | null
          module_id?: string | null
          opponent_ready?: boolean | null
          opponent_score?: number | null
          opponent_user_id?: string | null
          questions_data?: Json
          started_at?: string | null
          status?: string
          winner_user_id?: string | null
          xp_bet: number
        }
        Update: {
          completed_at?: string | null
          countdown_start_at?: string | null
          created_at?: string | null
          current_round?: number | null
          difficulty_level?: string | null
          host_ready?: boolean | null
          host_score?: number | null
          host_user_id?: string
          id?: string
          match_code?: string
          match_mode?: string | null
          max_groups?: number | null
          module_id?: string | null
          opponent_ready?: boolean | null
          opponent_score?: number | null
          opponent_user_id?: string | null
          questions_data?: Json
          started_at?: string | null
          status?: string
          winner_user_id?: string | null
          xp_bet?: number
        }
        Relationships: [
          {
            foreignKeyName: "pvp_matches_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_opponent_user_id_fkey"
            columns: ["opponent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pvp_questions: {
        Row: {
          created_at: string | null
          id: string
          level: string
          options: Json
          question: string
          question_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          options: Json
          question: string
          question_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          options?: Json
          question?: string
          question_id?: string
        }
        Relationships: []
      }
      pvp_queue: {
        Row: {
          created_at: string | null
          difficulty_level: string
          id: string
          match_id: string | null
          matched_at: string | null
          status: string | null
          user_id: string
          xp_bet: number
        }
        Insert: {
          created_at?: string | null
          difficulty_level: string
          id?: string
          match_id?: string | null
          matched_at?: string | null
          status?: string | null
          user_id: string
          xp_bet: number
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string
          id?: string
          match_id?: string | null
          matched_at?: string | null
          status?: string | null
          user_id?: string
          xp_bet?: number
        }
        Relationships: [
          {
            foreignKeyName: "pvp_queue_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "pvp_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          cost_points: number
          created_at: string
          id: string
          image_url: string | null
          name: string
          type: string
        }
        Insert: {
          cost_points: number
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          type: string
        }
        Update: {
          cost_points?: number
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          is_impulse: boolean
          is_recurring: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          is_impulse?: boolean
          is_recurring?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          is_impulse?: boolean
          is_recurring?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          acquired_at: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_progress: {
        Row: {
          completed_at: string | null
          id: string
          selected_option: number
          step_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          selected_option: number
          step_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          selected_option?: number
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "journey_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          module_id: string
          progress_percent: number | null
          quiz_score: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          module_id: string
          progress_percent?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          module_id?: string
          progress_percent?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_track_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          status: string
          track_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string
          track_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          status?: string
          track_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_track_progress_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "learning_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_speed_points: {
        Args: { is_correct: boolean; time_seconds: number }
        Returns: number
      }
      generate_match_code: { Args: never; Returns: string }
      reset_monthly_xp: { Args: never; Returns: undefined }
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
