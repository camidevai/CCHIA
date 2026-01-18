#!/bin/bash

# Script de build para Netlify
# Soluciona problemas con dependencias de Rollup

echo "🔧 Limpiando instalación anterior..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

echo "🏗️ Construyendo aplicación..."
npm run build

echo "✅ Build completado!"

