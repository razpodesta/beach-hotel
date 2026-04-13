# 🛡️ @metashark/identity-gateway: The Sovereign Access
**Versión:** 1.0 (NPM Publish Ready)
**Tipo:** Gateway de Identidad & Autenticación / UI Component
**Agnóstico:** Sí (Next.js / React 19)

## 1. Filosofía Arquitectónica: "Inversión de Control"
El `Identity Gateway` es un sistema inmunológico autónomo. Su responsabilidad exclusiva es verificar mediante criptografía (Supabase Auth) y biometría (ReCaptcha v3) que un usuario es humano y posee credenciales válidas.

**Zero-Knowledge CMS:** Esta librería NO SABE dónde se guardan los datos finales. Emite eventos (`onLoginSuccess`, `onRegisterSuccess`) para que la aplicación anfitriona (ej. el portafolio) gestione la base de datos (Payload CMS, Prisma, etc.).

## 2. Capacidades de Élite
- **i18n Autónomo:** Contiene sus propios diccionarios (es-ES, en-US, pt-BR) que actúan como fallback. El consumidor puede sobrescribirlos.
- **Entropía Dinámica:** Analizador visual de fortaleza de contraseñas mediante tokens OKLCH.
- **Anti-Bot Gating:** Validación L0 invisible mediante Google reCAPTCHA v3.
- **Strict ESM:** Compatible nativamente con Next.js 15 y Edge Runtime.