/**
 * Validación de tablas en Supabase
 * AC3: Si tablas existen → "Already set up" + exit 0
 * AC9: Validar 3 tablas creadas
 * AC10: Smoke test SELECT count
 */
import { execa } from 'execa';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

const EXPECTED_TABLES = ['content', 'categories', 'content_categories'];

/**
 * Verifica qué tablas existen en la base de datos
 * @returns {Promise<{content: boolean, categories: boolean, content_categories: boolean}>}
 */
export async function checkTablesExist() {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('content', 'categories', 'content_categories');
  `;

  try {
    const { stdout } = await execa('supabase', ['db', 'query', query], {
      cwd: ROOT_DIR,
    });

    // Parsear output (formato de tabla ASCII)
    // Ejemplo:
    //  table_name
    // ────────────
    //  content
    //  categories
    const existingTables = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => EXPECTED_TABLES.includes(line));

    return {
      content: existingTables.includes('content'),
      categories: existingTables.includes('categories'),
      content_categories: existingTables.includes('content_categories'),
    };
  } catch (error) {
    // Si falla la query, asumimos que no existen
    return {
      content: false,
      categories: false,
      content_categories: false,
    };
  }
}

/**
 * Verifica si todas las tablas necesarias existen
 * @returns {Promise<boolean>}
 */
export async function allTablesExist() {
  const tables = await checkTablesExist();
  return tables.content && tables.categories && tables.content_categories;
}

/**
 * Ejecuta smoke test: SELECT count(*) FROM content
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function runSmokeTest() {
  const query = 'SELECT count(*) FROM content;';

  try {
    await execa('supabase', ['db', 'query', query], {
      cwd: ROOT_DIR,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to query content table',
    };
  }
}

/**
 * Obtiene las tablas faltantes
 * @returns {Promise<string[]>}
 */
export async function getMissingTables() {
  const tables = await checkTablesExist();
  const missing = [];

  if (!tables.content) missing.push('content');
  if (!tables.categories) missing.push('categories');
  if (!tables.content_categories) missing.push('content_categories');

  return missing;
}
