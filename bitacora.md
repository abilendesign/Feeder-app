# Bitácora del Proyecto — Feederapp

## Fecha de inicio
2026-06-03

---

## Descripción del proyecto

Una aplicación para **escanear documentos** cuyo eje central es un **chatbot**.

La idea principal:
- El usuario va **chateando** con la app.
- A medida que avanza la conversación, **una tarjeta de información** se va modificando/actualizando en tiempo real.
- Esa tarjeta muestra **toda la información obtenida**, tanto:
  - La que sale del **chat** (lo que el usuario escribe / responde).
  - La que se obtiene de la **forma en que se mandó la información** (por ejemplo, el documento escaneado / cómo llegó la info).

### Resumen del flujo
1. Entra un documento o información (escaneo / envío).
2. El chatbot conversa con el usuario para extraer/confirmar/completar datos.
3. Una tarjeta visual se actualiza dinámicamente con todos los datos recolectados.

---

## Stack tecnológico

**Tipo de aplicación: App WEB.**

| Parte | Tecnología |
|-------|------------|
| App web | Next.js |
| Lenguaje | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Chatbot | Vercel AI SDK |
| IA visión/documentos | OpenAI API multimodal |
| JSON estructurado | OpenAI Structured Outputs + Zod |
| Audio | MediaRecorder API |
| Transcripción | OpenAI Speech-to-Text |
| Base de datos | Supabase Postgres |
| Archivos | Supabase Storage |
| Login | Supabase Auth |
| Mapa | Mapbox GL JS o MapLibre/Leaflet |
| Geocoding | Nominatim para MVP, Google Geocoding para producción |
| Hosting | Vercel |

### Notas sobre el stack
- **Entradas de información** (más allá del documento escaneado): texto del chat, **audio/voz** (MediaRecorder → transcripción con OpenAI Speech-to-Text) y **ubicación/mapa** (Mapbox/MapLibre + geocoding).
- **Extracción estructurada**: la info se normaliza a **JSON** vía OpenAI Structured Outputs validado con **Zod** → esto alimenta la "tarjeta de información".
- **Persistencia**: datos en Supabase Postgres, archivos (imágenes/PDF/audio) en Supabase Storage, usuarios con Supabase Auth.

---

## Diseño / UI

> **IMPORTANTE: esto es una app WEB.**

### Layout (distribución de pantalla)
- Pantalla dividida en **dos mitades (50% / 50%)**:
  - **Arriba (50%)**: el **mapa** + la **tarjeta** que se va rellenando con la info.
  - **Abajo (50%)**: el **chatbot**.

### Mapa (Mapbox)
- **Estilo oscuro** (dark).
- **Pines de color `#d6ff00`** (verde lima/amarillo neón).
- Mapa de fondo mostrando con **un pin la ubicación exacta** utilizada.

### Tarjeta de información
- **Fondo blanco** con **texto negro**.
- La información debe estar **muy bien organizada**.

### Botones
- **Botones de eliminar en color rojo.**

---

## Cuentas / Servicios
- **Correo del proyecto:** `Abilendesign@gmail.com`
- **GitHub:** CLI `gh` 2.93.0 instalada ✅ — **pendiente login** (`gh auth login`).
- **Vercel:** CLI 54.9.0 instalada ✅ — **pendiente login** (`vercel login`).

### Herramientas instaladas
- git 2.54 ✅ · Node v24.15 ✅ · npm 11.12 ✅ · gh 2.93.0 ✅ · vercel 54.9.0 ✅

---

## Estado actual
- 🟡 Fase de configuración inicial.
- Stack **definido**.
- Diseño/UI **definido** (ver sección Diseño).
- **Próximo paso acordado:** conectar **GitHub** y **Vercel** antes de empezar a programar.

---

## Pendientes / Preguntas abiertas

- [x] ~~Plataforma objetivo~~ → **App web** (Next.js).
- [x] ~~Stack tecnológico~~ → **Definido** (ver tabla arriba).
- [ ] Tipo de documentos a escanear (facturas, cédulas, formularios, etc.).
- [ ] Qué campos debe contener la **tarjeta de información** (definir el esquema Zod).
- [ ] Cómo entra la info: ¿upload de imagen/PDF, foto con cámara, audio, varios?
- [ ] Rol del **mapa/geocoding**: ¿la info incluye direcciones/ubicaciones?
- [ ] Estructura de datos en Supabase (tablas, relaciones).
- [ ] Modelo concreto de OpenAI a usar (visión y STT).

---

## Registro de cambios
| Fecha | Cambio |
|-------|--------|
| 2026-06-03 | Creación de la bitácora con el contexto inicial del proyecto. |
| 2026-06-03 | Agregado el stack tecnológico definitivo y actualizados los pendientes. |
| 2026-06-03 | Definido diseño/UI (layout 50/50, mapa oscuro, pines #d6ff00, tarjeta blanca, botones rojos). |
| 2026-06-03 | Instaladas las CLIs de GitHub (gh 2.93.0) y Vercel (54.9.0). Pendiente login interactivo. |
| 2026-06-03 | Vercel conectado (usuario: abilendesign). |
| 2026-06-03 | Proyecto Next.js creado (TS, Tailwind, app router, src/). Deps: ai, openai, zod, supabase, mapbox-gl. |
| 2026-06-03 | Shell UI completo: layout 50/50 (mapa+tarjeta arriba, chat abajo). Mapa oscuro, pin #d6ff00, tarjeta blanca, botones rojos. Build OK. |
| 2026-06-03 | Repo git iniciado + 1er commit. Remote: github.com/abilendesign/Feeder-app. Pendiente: gh auth login para push. |
| 2026-06-03 | GitHub autenticado (abilendesign) y push de `main` hecho. Código en github.com/abilendesign/Feeder-app. |
