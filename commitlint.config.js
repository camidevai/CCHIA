export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Documentación
        'style',    // Formato (no afecta código)
        'refactor', // Refactorización
        'perf',     // Mejoras de performance
        'test',     // Tests
        'chore',    // Mantenimiento
        'ci',       // CI/CD
        'build',    // Build system
        'revert'    // Revertir commit
      ]
    ],
    'scope-enum': [
      1, // Warning, no error
      'always',
      [
        'blog',     // Sistema de publicación
        'auth',     // Autenticación y roles
        'events',   // Calendario y eventos
        'a11y',     // Accesibilidad
        'seo',      // SEO
        'ui',       // Componentes UI
        'api',      // APIs/Supabase
        'config',   // Configuración
        'deps'      // Dependencias
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100]
  }
};
