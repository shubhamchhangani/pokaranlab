/**
 * Hand-written reference matching supabase/schema.sql — documentation, not currently wired
 * into the Supabase clients as a generic (see lib/supabase/client.ts). The installed
 * @supabase/postgrest-js expects the newer generated-types shape (Relationships,
 * __InternalSupabase), which only lines up with real CLI output. Once a real Supabase project
 * exists, regenerate and wire in with:
 *   npx supabase gen types typescript --project-id <id> > lib/types/database.ts
 */

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: true;
          name_en: string;
          name_hi: string;
          short_name: string;
          address_en: string;
          address_hi: string;
          phone: string;
          whatsapp: string;
          email: string;
          hours_en: string;
          hours_hi: string;
          maps_embed_url: string;
          maps_directions_url: string;
          updated_at: string;
        };
        Insert: never; // singleton row, seeded by schema.sql — never inserted from the app
        Update: Partial<Omit<Database["public"]["Tables"]["site_settings"]["Row"], "id">>;
      };
      test_categories: {
        Row: {
          id: string;
          name_en: string;
          name_hi: string;
          default_image_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["test_categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["test_categories"]["Row"]>;
      };
      tests: {
        Row: {
          id: string;
          category_id: string | null;
          name_en: string;
          name_hi: string;
          description_en: string;
          description_hi: string;
          sample_type: string;
          price: number;
          turnaround_time: string;
          home_collection_available: boolean;
          normal_range_template: Record<string, unknown> | null;
          primary_image_url: string | null;
          custom_fields: Record<string, unknown> | null;
          slug: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tests"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["tests"]["Row"]>;
      };
      packages: {
        Row: {
          id: string;
          name_en: string;
          name_hi: string;
          price: number;
          description_en: string | null;
          description_hi: string | null;
          primary_image_url: string | null;
          custom_fields: Record<string, unknown> | null;
          slug: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["packages"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["packages"]["Row"]>;
      };
      package_tests: {
        Row: { package_id: string; test_id: string };
        Insert: Partial<Database["public"]["Tables"]["package_tests"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["package_tests"]["Row"]>;
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          clinic_name: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["doctors"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["doctors"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          patient_profile_id: string | null;
          guest_name: string;
          guest_phone: string;
          guest_age: string | null;
          guest_sex: string | null;
          collection_type: "walk_in" | "home_collection";
          address: string | null;
          scheduled_date: string | null;
          scheduled_slot: string | null;
          doctor_id: string | null;
          status:
            | "pending"
            | "confirmed"
            | "sample_collected"
            | "processing"
            | "report_ready"
            | "cancelled";
          payment_status: "unpaid" | "paid";
          total_amount: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      booking_items: {
        Row: {
          id: string;
          booking_id: string;
          test_id: string | null;
          package_id: string | null;
          price_at_booking: number;
        };
        Insert: Partial<Database["public"]["Tables"]["booking_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["booking_items"]["Row"]>;
      };
      reports: {
        Row: {
          id: string;
          booking_id: string | null;
          sample_no: string;
          patient_name: string;
          age: string | null;
          sex: string | null;
          ref_by_doctor: string | null;
          sample_received_date: string | null;
          reporting_date: string | null;
          technician_name: string | null;
          pdf_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["reports"]["Row"]>;
      };
      report_results: {
        Row: {
          id: string;
          report_id: string;
          test_name: string;
          result_value: string;
          normal_range: string | null;
          flag: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["report_results"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["report_results"]["Row"]>;
      };
      media: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string | null;
          media_type: "image" | "video";
          url: string;
          caption_en: string | null;
          caption_hi: string | null;
          sort_order: number;
          is_primary: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["media"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["media"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          role: "patient" | "staff" | "admin";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      staff: {
        Row: { id: string; profile_id: string; staff_role: string };
        Insert: Partial<Database["public"]["Tables"]["staff"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["staff"]["Row"]>;
      };
    };
  };
};
