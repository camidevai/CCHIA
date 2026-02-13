/**
 * Verificación de Supabase CLI
 * AC4: CLI no instalado → guía + exit 1
 * AC5: No autenticado → ejecuta supabase login
 */
import { execa } from 'execa';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

/**
 * Verifica si Supabase CLI está instalado
 * @returns {Promise<{installed: boolean, version?: string}>}
 */
export async function checkSupabaseCLI() {
  try {
    const { stdout } = await execa('supabase', ['--version']);
    const version = stdout.trim();
    return { installed: true, version };
  } catch (error) {
    return { installed: false };
  }
}

/**
 * Verifica si el usuario está autenticado con Supabase
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    // Intenta listar proyectos (requiere autenticación)
    await execa('supabase', ['projects', 'list']);
    return true;
  } catch (error) {
    // Si falla con "not logged in" o similar, no está autenticado
    return false;
  }
}

/**
 * Ejecuta el flujo de login de Supabase (OAuth)
 * @returns {Promise<boolean>} true si login exitoso
 */
export async function loginSupabase() {
  try {
    await execa('supabase', ['login'], {
      stdio: 'inherit', // Heredar stdin/stdout para OAuth interactivo
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene el project_id desde .env
 * @returns {string|null}
 */
export function getProjectIdFromEnv() {
  const envPath = join(ROOT_DIR, '.env');

  if (!existsSync(envPath)) {
    return null;
  }

  try {
    const envContent = readFileSync(envPath, 'utf-8');
    // Buscar VITE_SUPABASE_URL=https://{project_id}.supabase.co
    const match = envContent.match(/VITE_SUPABASE_URL=https:\/\/([a-z0-9]+)\.supabase\.co/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica si el proyecto está linked con Supabase CLI
 * @param {string} projectId - Project ID esperado
 * @returns {boolean}
 */
export function isLinked(projectId) {
  const configPath = join(ROOT_DIR, 'supabase', 'config.toml');

  if (!existsSync(configPath)) {
    return false;
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    // Buscar project_id = "xxx" en config.toml
    const match = configContent.match(/project_id\s*=\s*"([^"]+)"/);
    return match && match[1] === projectId;
  } catch (error) {
    return false;
  }
}

/**
 * Linkea el proyecto con Supabase CLI
 * @param {string} projectRef - Project reference ID
 * @returns {Promise<boolean>}
 */
export async function linkProject(projectRef) {
  try {
    await execa('supabase', ['link', '--project-ref', projectRef], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Guía de instalación de Supabase CLI
 * @returns {string}
 */
export function getInstallGuide() {
  const platform = process.platform;

  let guide = `
Supabase CLI is not installed. Please install it:

`;

  if (platform === 'win32') {
    guide += `Windows:
  1. Install via Scoop:
     scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
     scoop install supabase

  2. Or via npm (global):
     npm install -g supabase

`;
  } else if (platform === 'darwin') {
    guide += `macOS:
  1. Install via Homebrew:
     brew install supabase/tap/supabase

  2. Or via npm (global):
     npm install -g supabase

`;
  } else {
    // Linux
    guide += `Linux:
  1. Install via Homebrew:
     brew install supabase/tap/supabase

  2. Or via npm (global):
     npm install -g supabase

`;
  }

  guide += `
For more installation options, visit:
https://supabase.com/docs/guides/cli/getting-started

`;

  return guide;
}
