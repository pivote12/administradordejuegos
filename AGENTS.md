# AGENTS.md — Administrador De Juegos

Documento de referencia para asistentes de IA (Cursor, Copilot, ChatGPT, etc.) que trabajen en este repositorio.

**Repositorio:** https://github.com/pivote12/administradordejuegos  
**Autor principal:** José Rafael Rodriguez Morillo  
**Tipo de proyecto:** sitio web estático (HTML + CSS + JavaScript vanilla). **No hay build, npm ni bundler.**

---

## ¿De qué trata?

**Administrador De Juegos** es un launcher / biblioteca local de minijuegos creados en el navegador. La página principal (`index.html`) muestra una grilla de juegos; el usuario elige uno y entra a jugar. Hay un selector de **12 idiomas** que traduce el menú y (parcialmente) el interior de cada juego.

Los juegos son apps front-end independientes dentro de `Juegos/<Nombre del juego>/`, cada una con su propio `index.html`.

### Juegos actuales (8)

| ID (`games.json`) | Carpeta | Creador |
|---|---|---|
| `algicosathlon-maker-english` | Algicosathlon Maker In English | José Rafael Rodriguez Morillo |
| `decimal-explorer` | Decimal Explorer | José Rafael Rodriguez Morillo |
| `bruchimichis` | bruchimichis | Lourdes Roulier |
| `creador-2d` | Creador 2D | José Rafael Rodriguez Morillo |
| `object-battle` | Object Battle | José Rafael Rodriguez Morillo |
| `bloc-de-notas` | Bloc De Notas | José Rafael Rodriguez Morillo |
| `country-notes` | Country Notes | José Rafael Rodriguez Morillo |
| `shape-bowl-race` | Shape Bowl Race | José Rafael Rodriguez Morillo |

---

## Estructura del proyecto

```
Administrador De Juegos/          ← raíz del servidor (document root)
├── index.html                    ← menú / biblioteca de juegos
├── admin.js                      ← lógica del administrador + GAME_I18N
├── games.json                    ← registro de juegos (fuente de verdad)
├── i18n.js                       ← sistema i18n compartido entre juegos
├── styles.css
├── JUGAR.bat                     ← arranca servidor local en Windows
├── AGENTS.md                     ← este archivo
└── Juegos/
    └── <Nombre del juego>/
        ├── index.html            ← punto de entrada del juego
        ├── game.js               ← (u otro .js principal)
        ├── styles.css
        ├── JUGAR.bat             ← abre admin en localhost (legacy)
        └── music/                ← opcional (.webm)
```

### Rutas importantes

- Menú → juego: `Juegos/<folder>/index.html` (generado en `admin.js` → `gamePath()`).
- Juego → menú: enlace `../../index.html` (botón «Volver al administrador»).
- i18n compartido desde un juego: `<script src="../../i18n.js"></script>`.

---

## Cómo verlo en el servidor (obligatorio)

Este proyecto **debe servirse por HTTP**. Abrir `index.html` con `file://` **no funciona bien** porque:

1. `admin.js` hace `fetch("games.json")` — falla sin servidor.
2. Los juegos usan `fetch`, `localStorage`, rutas relativas y a veces audio.
3. El botón «Volver al administrador» asume rutas web.

### Desarrollo local (Windows)

**Opción recomendada:** doble clic en `JUGAR.bat` en la raíz del proyecto.

```bat
python -m http.server 8090
```

Abre: **http://localhost:8090**

Requisito: **Python 3** instalado y en el PATH.

### Desarrollo local (terminal manual)

Desde la **raíz del repo** (donde está `index.html`):

```bash
# Python 3
python -m http.server 8090

# Node (si no hay Python)
npx --yes serve -p 8090

# PHP
php -S localhost:8090
```

Luego abrir `http://localhost:8090`.

### Producción / servidor público

Es un sitio **100 % estático**. Opciones:

| Plataforma | Qué hacer |
|---|---|
| **GitHub Pages** | Repo → Settings → Pages → Source: branch `main`, folder `/ (root)` |
| **Netlify / Vercel / Cloudflare Pages** | Conectar repo; build command vacío; publish directory = raíz |
| **VPS / nginx / Apache** | Copiar archivos; `root` apuntando a la carpeta del proyecto |
| **Cualquier hosting estático** | Subir todo el contenido de la raíz |

**Document root = carpeta que contiene `index.html`.** No subir solo `Juegos/`; hay que subir la raíz completa.

Puerto típico en local: **8090** (convención del proyecto). En producción usar 80/443 del hosting.

### Comprobar que funciona

1. `http://<host>/` muestra la biblioteca con 8 juegos.
2. Clic en «Jugar» abre el juego.
3. Cambiar idioma en 🌐 traduce nombres/descripciones del menú.
4. Dentro de un juego, «Volver al administrador» regresa al menú.

---

## Cómo añadir un juego nuevo

1. Crear carpeta `Juegos/Mi Juego/` con al menos `index.html`, JS y CSS.
2. Registrar en **`games.json`**:

```json
{
  "id": "mi-juego",
  "name": "Mi Juego",
  "description": "Descripción corta.",
  "folder": "Mi Juego",
  "icon": "🎮",
  "tags": ["tag1"],
  "creator": "Nombre del creador"
}
```

3. Añadir traducciones del menú en **`admin.js`** → objeto `GAME_I18N` (12 idiomas: es, en, fr, de, pt, it, ru, pl, nl, zh, ja, ko).
4. Añadir traducciones internas en **`i18n.js`** → `GAMES["mi-juego"]` y opcionalmente `LOCALE_PATCH`.
5. Duplicar entrada en **`FALLBACK_GAMES`** dentro de `admin.js` (por si falla el fetch de `games.json`).
6. En el HTML del juego:
   - `<script src="../../i18n.js"></script>`
   - `GameI18n.init("mi-juego");` al inicio del JS
   - Atributos `data-i18n`, `data-i18n-placeholder` en textos traducibles
   - Botón volver: `<a href="../../index.html" id="btnBackToAdmin">` (mostrar si la URL contiene `/Juegos/`)

**No hace falta** tocar webpack, package.json ni compilar nada.

---

## Sistema de idiomas (i18n)

| Archivo | Rol |
|---|---|
| `i18n.js` | Traducciones **dentro** de cada juego. Clave `admin-lang` en `localStorage`. |
| `admin.js` → `UI` | Textos del **menú** administrador. |
| `admin.js` → `GAME_I18N` | Nombres y descripciones de juegos en la grilla. |

### Reglas para IA al traducir

- Idiomas soportados: `es`, `en`, `fr`, `de`, `pt`, `it`, `ru`, `pl`, `nl`, `zh`, `ja`, `ko`.
- Función helper en `i18n.js`: `L(es, en, fr, de, pt, it)` — rellena ru/pl/nl/zh/ja/ko con inglés + `LOCALE_PATCH`.
- En HTML: `data-i18n="clave"`, `data-i18n-placeholder="clave"`.
- En JS: `GameI18n.t("clave", { n: 3 })` con placeholders `{nombre}`.
- **`bruchimichis`:** el **nombre del juego no se traduce** — siempre `bruchimichis` en todos los idiomas.
- Otros títulos de juegos **sí** deben traducirse en `GAME_I18N` e `i18n.js`.

---

## Persistencia de datos

Los juegos guardan progreso en **`localStorage`** del navegador (partidas, pelotitas, países, notas, etc.). No hay backend ni base de datos. Cada juego usa su propia clave (`STORAGE_KEY` en su `game.js`).

---

## Convenciones de código para IA

1. **JavaScript vanilla** — sin frameworks. Mantener el estilo del archivo que editas.
2. **Cambios mínimos** — no refactorizar lo no pedido.
3. **Rutas relativas** — respetar `../../i18n.js` desde juegos en `Juegos/`.
4. **Espacios en nombres de carpeta** — codificar en URLs (`encodeURIComponent` ya lo hace `gamePath()`).
5. **Commits** — solo si el usuario lo pide explícitamente.
6. **No añadir** `.env`, credenciales ni dependencias pesadas sin pedido.
7. Archivos de audio en `music/*.webm` — son assets binarios; no editarlos como texto.

---

## Archivos clave al modificar funcionalidad

| Tarea | Archivos |
|---|---|
| Nuevo juego en el menú | `games.json`, `admin.js` (GAME_I18N + FALLBACK_GAMES), carpeta en `Juegos/` |
| Traducir menú | `admin.js` → `UI`, `GAME_I18N` |
| Traducir interior de juego | `i18n.js`, HTML (`data-i18n`), JS (`GameI18n.t()`) |
| Estilos del launcher | `styles.css` (raíz), `admin.js` |
| Lógica Shape Bowl Race | `Juegos/Shape Bowl Race/game.js` |
| Algicosathlon / pelotitas | `Juegos/Algicosathlon Maker In English/` |

---

## Git y despliegue desde el repo

```bash
git clone https://github.com/pivote12/administradordejuegos.git
cd administradordejuegos
python -m http.server 8090
# Abrir http://localhost:8090
```

Rama principal: **`main`**.

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Biblioteca vacía / sin juegos | Abrir con `file://` o `games.json` inaccesible | Usar servidor HTTP desde la raíz |
| Juego no aparece | Falta entrada en `games.json` | Registrar juego + FALLBACK_GAMES |
| Traducciones rotas | Falta clave en `i18n.js` o `GameI18n.init` con id incorrecto | Verificar id coincide con `games.json` |
| 404 en i18n | Ruta script incorrecta | Debe ser `../../i18n.js` desde `Juegos/X/` |
| Música no suena | Política autoplay del navegador | Normal; suele iniciar tras interacción del usuario |

---

## Resumen en una frase

**Launcher estático de minijuegos en el navegador: servir la raíz del repo por HTTP (puerto 8090 en local), registrar juegos en `games.json`, traducir con `i18n.js` + `admin.js`, y cada juego vive en su carpeta bajo `Juegos/`.**
