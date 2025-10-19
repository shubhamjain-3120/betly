export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          current_streak: number;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          current_streak?: number;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          current_streak?: number;
        };
      };
      bets: {
        Row: {
          id: string;
          title: string;
          amount: number;
          option_a: string;
          option_b: string;
          creator_id: string;
          creator_choice: 'a' | 'b';
          status: 'pending' | 'active' | 'concluded';
          winner_option: 'a' | 'b' | null;
          created_at: string;
          concluded_at: string | null;
          concluded_by_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          amount: number;
          option_a: string;
          option_b: string;
          creator_id: string;
          creator_choice: 'a' | 'b';
          status?: 'pending' | 'active' | 'concluded';
          winner_option?: 'a' | 'b' | null;
          created_at?: string;
          concluded_at?: string | null;
          concluded_by_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          amount?: number;
          option_a?: string;
          option_b?: string;
          creator_id?: string;
          creator_choice?: 'a' | 'b';
          status?: 'pending' | 'active' | 'concluded';
          winner_option?: 'a' | 'b' | null;
          created_at?: string;
          concluded_at?: string | null;
          concluded_by_id?: string | null;
        };
      };
    };
  };
}
