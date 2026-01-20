import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// OPCIÓN 1: Usar variables de entorno (RECOMENDADO)
// Crea un archivo .env en la raíz del proyecto con:
// VITE_SUPABASE_URL=https://uwaapfclxbmlnywhzzjc.supabase.co
// VITE_SUPABASE_ANON_KEY=tu_anon_public_key_aqui

// OPCIÓN 2: Hardcodear las credenciales aquí (solo para desarrollo)
// Ve a: https://uwaapfclxbmlnywhzzjc.supabase.co → Project Settings → API

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwaapfclxbmlnywhzzjc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'REEMPLAZAR_CON_TU_ANON_KEY';

// Validar que las credenciales estén configuradas
if (!supabaseAnonKey || supabaseAnonKey === 'REEMPLAZAR_CON_TU_ANON_KEY') {
  console.error('❌ ERROR: Supabase API key no configurada');
  console.error('📝 Sigue estos pasos:');
  console.error('1. Ve a: https://uwaapfclxbmlnywhzzjc.supabase.co');
  console.error('2. Click en "Project Settings" (⚙️)');
  console.error('3. Click en "API"');
  console.error('4. Copia la "anon public" key');
  console.error('5. Crea un archivo .env en la raíz con:');
  console.error('   VITE_SUPABASE_URL=https://uwaapfclxbmlnywhzzjc.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=tu_key_aqui');
  console.error('6. Reinicia el servidor: npm run dev');
}

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

