export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      account_profiles: {
        Row: { user_id: string; role: string; display_name: string; email: string; created_at: string; updated_at: string };
        Insert: { user_id: string; role: string; display_name: string; email: string; created_at?: string; updated_at?: string };
        Update: { user_id?: string; role?: string; display_name?: string; email?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      creator_profiles: {
        Row: { user_id: string; display_name: string; email: string; phone: string; location: string; niche: string; bio: string; availability: string; socials: Json; rates: Json; published: boolean; updated_at: string };
        Insert: { user_id: string; display_name: string; email: string; phone: string; location: string; niche: string; bio: string; availability: string; socials?: Json; rates?: Json; published?: boolean; updated_at?: string };
        Update: { user_id?: string; display_name?: string; email?: string; phone?: string; location?: string; niche?: string; bio?: string; availability?: string; socials?: Json; rates?: Json; published?: boolean; updated_at?: string };
        Relationships: [{ foreignKeyName: "creator_profiles_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "account_profiles"; referencedColumns: ["user_id"] }];
      };
      business_profiles: {
        Row: { user_id: string; contact_name: string; work_email: string; company_name: string; website: string; industry: string; team_size: string; monthly_budget: string; goals: string[]; updated_at: string };
        Insert: { user_id: string; contact_name: string; work_email: string; company_name: string; website?: string; industry: string; team_size: string; monthly_budget: string; goals?: string[]; updated_at?: string };
        Update: { user_id?: string; contact_name?: string; work_email?: string; company_name?: string; website?: string; industry?: string; team_size?: string; monthly_budget?: string; goals?: string[]; updated_at?: string };
        Relationships: [{ foreignKeyName: "business_profiles_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "account_profiles"; referencedColumns: ["user_id"] }];
      };
      shortlist_items: {
        Row: { business_user_id: string; creator_catalog_id: number; created_at: string };
        Insert: { business_user_id: string; creator_catalog_id: number; created_at?: string };
        Update: { business_user_id?: string; creator_catalog_id?: number; created_at?: string };
        Relationships: [{ foreignKeyName: "shortlist_items_business_user_id_fkey"; columns: ["business_user_id"]; isOneToOne: false; referencedRelation: "business_profiles"; referencedColumns: ["user_id"] }];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
