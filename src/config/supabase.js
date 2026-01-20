import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://uwaapfclxbmlnywhzzjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YWFwZmNseGJtbG55d2h6empjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MTI4MDAsImV4cCI6MjA1Mjk4ODgwMH0.sb_publishable_E_oRF-hIm8v2je3svctYYg_TNx_BNGM';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper functions para eventos
export const eventsAPI = {
  // Obtener todos los eventos
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener eventos futuros
  async getUpcoming() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', now)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener un evento por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo evento
  async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar evento
  async update(id, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar evento
  async delete(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};

// Helper functions para autenticación
export const authAPI = {
  // Login con email y password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Obtener sesión actual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Verificar si hay usuario autenticado
  async isAuthenticated() {
    const session = await this.getSession();
    return !!session;
  },
};

export default supabase;

