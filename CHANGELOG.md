# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated CMS setup script with Supabase migrations: OAuth authentication, idempotent execution, modular architecture (#005)
- SEO meta tags, JSON-LD Article schema, Open Graph and Twitter Card tags for blog pages (#004)
- ShareButtons component (LinkedIn, X, Facebook) with WCAG 2.5.5 minimum target size
- SEOMeta shared component with react-helmet-async for dynamic meta management
- Markdown rendering utility extracted to shared lib for reuse
- Keyboard navigation (arrow keys) for TypeTabs, focus-within for PostCard
- aria-live region for blog results, aria-hidden on decorative SVGs
- CMS admin write module: CMSDashboard, EditorPage with Markdown editor and live preview (#003)
- Content CRUD operations: create, edit, publish, unpublish, archive, delete
- SEO fields and preview (Google SERP + social cards)
- Image upload with Supabase Storage
- Draft management with auto-generated slugs and validation
- WCAG AA accessibility: aria-live regions, focus trap, aria-required
- Public blog reading module: BlogPage, PostDetailPage with Markdown rendering (#002)
- Blog filters: type tabs (article/news/resource) and category chips
- ARIA-compliant blog components with keyboard navigation
- Database schema for Blog/CMS: content, categories, content_categories tables (#001)
- RLS policies for anonymous and authenticated users
- Content type and status ENUMs
