#!/usr/bin/env node
/**
 * Script de Setup CMS - Aplica migraciones de Supabase con idempotencia
 *
 * Issue: #005
 * Criterios de Aceptación: AC1-AC17
 *
 * Fases:
 * 1. Preflight checks (CLI, auth, linking)
 * 2. Database state check (idempotencia)
 * 3. Apply migrations (dry-run + confirmación)
 * 4. Validation (tablas + smoke test)
 */
import { logger } from './lib/logger.mjs';
import {
  checkSupabaseCLI,
  isAuthenticated,
  loginSupabase,
  getProjectIdFromEnv,
  isLinked,
  linkProject,
  getInstallGuide,
} from './lib/check-cli.mjs';
import {
  allTablesExist,
  checkTablesExist,
  getMissingTables,
  runSmokeTest,
} from './lib/validate-tables.mjs';
import inquirer from 'inquirer';
import { execa } from 'execa';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

/**
 * FASE 1: Preflight Checks
 * AC4, AC5, AC13
 */
async function phase1_preflightChecks() {
  logger.nl();
  logger.progress(1, 4, 'Checking Supabase CLI...');

  // 1. Verificar que CLI está instalado
  const cliCheck = await checkSupabaseCLI();

  if (!cliCheck.installed) {
    logger.nl();
    logger.error('Supabase CLI is not installed');
    logger.nl();
    console.log(getInstallGuide());
    process.exit(1); // AC4
  }

  logger.success(`CLI detected (${cliCheck.version})`);

  // 2. Verificar autenticación
  logger.nl();
  logger.progress(2, 4, 'Verifying authentication...');

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    logger.warn('Not authenticated. Opening login...');
    logger.nl();

    // AC5: Ejecutar supabase login (OAuth)
    const loginSuccess = await loginSupabase();

    if (!loginSuccess) {
      logger.error('Login failed');
      logger.info('Try running manually: supabase login');
      process.exit(1);
    }

    logger.success('Authenticated');
  } else {
    logger.success('Authenticated');
  }

  // 3. Verificar linking del proyecto
  logger.nl();
  logger.progress(3, 4, 'Checking project link...');

  const projectId = getProjectIdFromEnv();

  if (!projectId) {
    logger.error('Could not find project ID in .env');
    logger.info('Make sure VITE_SUPABASE_URL is set in .env');
    process.exit(1);
  }

  const linked = isLinked(projectId);

  if (!linked) {
    logger.warn(`Project not linked. Linking to ${projectId}...`);
    logger.nl();

    const linkSuccess = await linkProject(projectId);

    if (!linkSuccess) {
      logger.error('Failed to link project');
      logger.info(`Try running manually: supabase link --project-ref ${projectId}`);
      process.exit(1);
    }

    logger.success(`Linked to project ${projectId}`);
  } else {
    logger.success(`Linked to project ${projectId}`);
  }
}

/**
 * FASE 2: Database State Check
 * AC3 (idempotencia)
 */
async function phase2_databaseStateCheck() {
  logger.nl();
  logger.progress(4, 4, 'Checking database state...');

  const allExist = await allTablesExist();

  if (allExist) {
    logger.nl();
    logger.info('CMS already set up (all tables exist)');
    logger.success('Nothing to do!');
    logger.nl();
    return false; // No necesita aplicar migrations
  }

  // Mostrar tablas faltantes
  const missing = await getMissingTables();

  if (missing.length > 0) {
    logger.nl();
    logger.info(`Missing tables: ${missing.join(', ')}`);
  }

  return true; // Necesita aplicar migrations
}

/**
 * FASE 3: Apply Migrations
 * AC1, AC2, AC6, AC7, AC8
 */
async function phase3_applyMigrations() {
  logger.nl();
  logger.step('Preparing to apply migrations...');
  logger.nl();

  // AC6: Dry run (mostrar cambios)
  try {
    logger.info('Showing migration preview...');
    logger.nl();

    // Ejecutar supabase db diff para mostrar cambios
    // Nota: db diff compara con estado actual, no muestra el contenido completo
    // Para mejor UX, mostramos el archivo de migración
    const { stdout } = await execa('supabase', ['db', 'push', '--dry-run'], {
      cwd: ROOT_DIR,
      reject: false, // No lanzar error si hay diff
    });

    if (stdout.trim()) {
      console.log(stdout);
      logger.nl();
    }

    logger.info('Migration will create:');
    logger.info('  • Types: content_type, content_status');
    logger.info('  • Tables: categories, content, content_categories');
    logger.info('  • RLS policies for all tables');
    logger.nl();
  } catch (error) {
    logger.warn('Could not generate preview (proceeding anyway)');
    logger.nl();
  }

  // AC7: Confirmación explícita
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Apply these migrations?',
      default: true,
    },
  ]);

  if (!confirm) {
    // AC8: Usuario cancela
    logger.nl();
    logger.info('Cancelled by user');
    logger.nl();
    process.exit(0);
  }

  // Aplicar migrations
  logger.nl();
  logger.step('Applying migrations...');
  logger.nl();

  try {
    await execa('supabase', ['db', 'push'], {
      cwd: ROOT_DIR,
      stdio: 'inherit', // Mostrar output en tiempo real
    });

    logger.nl();
    logger.success('Migrations applied successfully');
  } catch (error) {
    logger.nl();
    logger.error('Failed to apply migrations');
    logger.info('Try running manually: supabase db push');
    logger.nl();
    throw error;
  }
}

/**
 * FASE 4: Validation
 * AC9, AC10, AC14
 */
async function phase4_validation() {
  logger.nl();
  logger.step('Validating setup...');
  logger.nl();

  // AC9: Verificar que las 3 tablas fueron creadas
  const tables = await checkTablesExist();

  if (!tables.content) {
    throw new Error('Table "content" was not created');
  }
  if (!tables.categories) {
    throw new Error('Table "categories" was not created');
  }
  if (!tables.content_categories) {
    throw new Error('Table "content_categories" was not created');
  }

  logger.success('All tables created: content, categories, content_categories');

  // AC10: Smoke test
  const smokeTest = await runSmokeTest();

  if (!smokeTest.success) {
    throw new Error(`Smoke test failed: ${smokeTest.error}`);
  }

  logger.success('Smoke test passed (SELECT count(*) FROM content)');

  // AC14: Mensaje final con next steps
  logger.nl();
  logger.success('CMS setup completed! 🎉');
  logger.nl();
  logger.info('Next steps:');
  logger.info('  1. Start dev server: npm run dev');
  logger.info('  2. Open http://localhost:5173/admin/cms');
  logger.info('  3. Create your first post');
  logger.nl();
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║  CCHIA - CMS Setup Script              ║');
  console.log('║  Supabase Migration Automation         ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // Fase 1: Preflight checks
    await phase1_preflightChecks();

    // Fase 2: Database state check
    const needsMigration = await phase2_databaseStateCheck();

    if (!needsMigration) {
      // AC3: Already set up
      process.exit(0);
    }

    // Fase 3: Apply migrations
    await phase3_applyMigrations();

    // Fase 4: Validation
    await phase4_validation();

    process.exit(0);
  } catch (error) {
    logger.nl();
    logger.error(`Fatal error: ${error.message}`);
    logger.nl();

    // AC12: Mensajes de error accionables
    if (error.message.includes('not logged in')) {
      logger.info('Run: supabase login');
    } else if (error.message.includes('project')) {
      logger.info('Check your .env file and ensure VITE_SUPABASE_URL is correct');
    } else {
      logger.info('Check the logs above for more details');
    }

    logger.nl();
    process.exit(1);
  }
}

main();
