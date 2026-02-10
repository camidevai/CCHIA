-- ============================================
-- MIGRACIÓN: Blog/CMS Schema para CCHIA
-- Fecha: 2026-02-09
-- Issue: #001
-- ============================================

-- ============================================
-- 1. TIPOS ENUM
-- ============================================

-- Tipo de contenido
CREATE TYPE content_type AS ENUM ('article', 'news', 'resource');

-- Estado del contenido
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- ============================================
-- 2. TABLA: categories
-- ============================================

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsqueda por slug
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================
-- 3. TABLA: content
-- ============================================

CREATE TABLE content (
  id BIGSERIAL PRIMARY KEY,

  -- Tipo y identificación
  type content_type NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,

  -- Campos SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,

  -- Metadata
  status content_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,

  -- Imágenes y archivos
  featured_image TEXT,
  file_url TEXT,              -- Solo para resources
  file_name TEXT,             -- Solo para resources

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Autor (referencia a auth.users)
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para consultas frecuentes
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_featured ON content(featured) WHERE featured = true;

-- ============================================
-- 4. TABLA: content_categories (M2M)
-- ============================================

CREATE TABLE content_categories (
  content_id BIGINT REFERENCES content(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

-- Índices para joins eficientes
CREATE INDEX idx_content_categories_content ON content_categories(content_id);
CREATE INDEX idx_content_categories_category ON content_categories(category_id);

-- ============================================
-- 5. FUNCIÓN: Actualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para auto-update de updated_at
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- Políticas para: categories
-- ----------------------------------------

-- Anónimos y autenticados pueden leer todas las categorías
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT
  USING (true);

-- Solo autenticados pueden insertar categorías
CREATE POLICY "categories_insert_authenticated" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo autenticados pueden actualizar categorías
CREATE POLICY "categories_update_authenticated" ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Solo autenticados pueden eliminar categorías
CREATE POLICY "categories_delete_authenticated" ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- ----------------------------------------
-- Políticas para: content
-- ----------------------------------------

-- Anónimos pueden leer solo contenido publicado
CREATE POLICY "content_select_published" ON content
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Autenticados pueden leer todo el contenido
CREATE POLICY "content_select_authenticated" ON content
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo autenticados pueden insertar contenido
CREATE POLICY "content_insert_authenticated" ON content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Solo autenticados pueden actualizar su propio contenido
CREATE POLICY "content_update_authenticated" ON content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Solo autenticados pueden eliminar su propio contenido
CREATE POLICY "content_delete_authenticated" ON content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ----------------------------------------
-- Políticas para: content_categories
-- ----------------------------------------

-- Anónimos pueden leer relaciones de contenido publicado
CREATE POLICY "content_categories_select_published" ON content_categories
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = content_categories.content_id
      AND content.status = 'published'
    )
  );

-- Autenticados pueden leer todas las relaciones
CREATE POLICY "content_categories_select_authenticated" ON content_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo autenticados pueden gestionar relaciones
CREATE POLICY "content_categories_insert_authenticated" ON content_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = content_categories.content_id
      AND content.author_id = auth.uid()
    )
  );

CREATE POLICY "content_categories_delete_authenticated" ON content_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = content_categories.content_id
      AND content.author_id = auth.uid()
    )
  );

-- ============================================
-- 7. DATOS DE PRUEBA
-- ============================================

-- Insertar categorías de ejemplo
INSERT INTO categories (slug, name, description) VALUES
  ('inteligencia-artificial', 'Inteligencia Artificial', 'Artículos sobre IA, machine learning y deep learning'),
  ('noticias', 'Noticias', 'Últimas novedades del ecosistema de IA en Chile'),
  ('recursos', 'Recursos', 'Guías, tutoriales y materiales descargables');

-- NOTA: El post de prueba debe insertarse después de que exista un usuario autenticado.
-- Ejecutar manualmente en Supabase SQL Editor después de tener un admin:
--
-- INSERT INTO content (type, slug, title, excerpt, body, status, author_id) VALUES
--   ('article',
--    'bienvenidos-a-cchia',
--    'Bienvenidos a la Cámara Chilena de Inteligencia Artificial',
--    'Conoce nuestra misión y visión para impulsar la IA en Chile.',
--    '# Bienvenidos a CCHIA\n\nLa **Cámara Chilena de Inteligencia Artificial** nace con la misión de conectar profesionales, empresas y entusiastas del ecosistema de IA en Chile.\n\n## Nuestra Misión\n\nPromover el desarrollo responsable y ético de la inteligencia artificial en Chile.\n\n## Únete\n\nSé parte de la comunidad que está transformando el futuro tecnológico de Chile.',
--    'draft',
--    'TU_USER_ID_AQUI');

-- ============================================
-- 8. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE content IS 'Almacena artículos, noticias y recursos del blog';
COMMENT ON TABLE categories IS 'Categorías para organizar el contenido';
COMMENT ON TABLE content_categories IS 'Relación muchos-a-muchos entre contenido y categorías';

COMMENT ON COLUMN content.type IS 'Tipo: article, news, resource';
COMMENT ON COLUMN content.status IS 'Estado: draft, published, archived';
COMMENT ON COLUMN content.file_url IS 'URL del archivo descargable (solo para resources)';
COMMENT ON COLUMN content.og_image IS 'Imagen para Open Graph (redes sociales)';
