/**
 * Logger con colores y símbolos
 * AC11: Logging usa colores y símbolos: ✓ (verde), ✗ (rojo), ⚠ (amarillo), → (cyan), ℹ (azul)
 */
import chalk from 'chalk';

export const logger = {
  /**
   * Mensaje de éxito (verde)
   * @param {string} msg
   */
  success(msg) {
    console.log(chalk.green('✓') + ' ' + msg);
  },

  /**
   * Mensaje de error (rojo)
   * @param {string} msg
   */
  error(msg) {
    console.error(chalk.red('✗') + ' ' + chalk.red(msg));
  },

  /**
   * Mensaje de advertencia (amarillo)
   * @param {string} msg
   */
  warn(msg) {
    console.warn(chalk.yellow('⚠') + ' ' + chalk.yellow(msg));
  },

  /**
   * Mensaje informativo (azul)
   * @param {string} msg
   */
  info(msg) {
    console.log(chalk.blue('ℹ') + ' ' + chalk.blue(msg));
  },

  /**
   * Mensaje de paso/acción (cyan)
   * @param {string} msg
   */
  step(msg) {
    console.log(chalk.cyan('→') + ' ' + msg);
  },

  /**
   * Nueva línea
   */
  nl() {
    console.log();
  },

  /**
   * Progreso con fase actual
   * @param {number} current - Fase actual (1-4)
   * @param {number} total - Total de fases
   * @param {string} msg - Descripción de la fase
   */
  progress(current, total, msg) {
    console.log(chalk.cyan(`→ ${current}/${total}`) + ' ' + msg);
  },
};
