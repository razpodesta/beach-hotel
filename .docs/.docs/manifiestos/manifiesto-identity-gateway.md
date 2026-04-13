# Manifiesto de Arquitectura: Identity Gateway (The Sovereign Access)
**Paquete:** `@metashark/identity-access-management`
**Versión:** 1.0 (NPM Publish Ready)
**Estatus:** OBLIGATORIO Y SSoT
**Autor:** Raz Podestá - MetaShark Tech

## 1. Filosofía Arquitectónica: "Inversión de Control y Agnosticismo"
El `Identity Gateway` es un sistema inmunológico y de acceso autónomo. Su responsabilidad termina en el momento en que verifica criptográficamente que un humano es quien dice ser. 
**No debe saber nada sobre Payload CMS, Prisma, u ORMs**. Utiliza el patrón de *Inversión de Control (IoC)*: la librería emite eventos (ej. `onIdentityLinked`) y la aplicación anfitriona decide en qué base de datos guardar el registro.

## 2. Los 4 Pilares de la Librería Autónoma

### I. Aislamiento de Diccionarios (Autonomous i18n)
La librería no puede depender del motor MACS (`dictionary.schema.ts`) del proyecto anfitrión.
- **Solución:** Empaquetará sus propios archivos JSON (`en-US.json`, `es-ES.json`, `pt-BR.json`) y un esquema Zod interno. Expondrá una interfaz `IdentityDictionary` para que el consumidor pueda sobrescribir los textos vía Props si lo desea.

### II. Gating de Seguridad (Anti-Bot & Rate Limiting)
Debe encapsular nativamente:
- Validación invisible de **ReCaptcha v3**.
- **Entropía de Contraseñas:** Validador visual y lógico de fortaleza de contraseñas (Mínimo 8 caracteres, alfanumérico + símbolos).

### III. Abstracción del Estado (Stateless UI)
La librería no utilizará `Zustand` internamente para controlar la apertura de modales para no colisionar con el Store del anfitrión. 
- Los componentes serán **Controlados**: `<AuthModal isOpen={boolean} onClose={fn} />`.

### IV. Server Actions Nativas
Exportará *Server Actions* puras que interactúan directamente con Supabase Auth. El manejo de las cookies (`@supabase/ssr`) estará encapsulado dentro de la librería.

## 3. Topología Física del Paquete
```text
packages/identity-gateway/
├── src/
│   ├── ui/
│   │   ├── AuthModal.tsx         (El contenedor visual Takeover)
│   │   ├── LoginForm.tsx         (Acceso existente)
│   │   ├── RegisterForm.tsx      (NUEVO: Creación de identidad)
│   │   ├── PasswordStrength.tsx  (NUEVO: Medidor de entropía visual OKLCH)
│   │   └── SocialLogin.tsx       (NUEVO: Botones OAuth atomizados)
│   ├── actions/
│   │   ├── server-auth.ts        (Server Actions de Supabase)
│   │   └── oauth-callback.ts     (Lógica para la ruta de callback)
│   ├── schemas/
│   │   ├── auth.schema.ts        (Contratos Zod para Login/Registro)
│   │   └── i18n.schema.ts        (Contrato del diccionario interno)
│   ├── security/
│   │   └── recaptcha.ts          (Validación L0)
│   ├── i18n/
│   │   ├── locales/              (es-ES.json, etc.)
│   │   └── provider.ts           (Merge profundo de diccionarios)
│   └── index.ts                  (Fachada Pública / Barrel File)