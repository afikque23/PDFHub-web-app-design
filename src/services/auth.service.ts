import { supabase } from '../lib/supabase';

export const authService = {
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token || null;
  },
};
