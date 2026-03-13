# AWT-Engine-Hub

A static GitHub Pages gallery for **AWT-generated** visual effects.

## How it works
- Effects are stored as self‑contained HTML files in `effects/`.
- `effects/index.json` is the gallery index. The website reads this file to render cards.
- Contributions are made via Pull Request.

## Pagination
- Default page size: **12** cards per page.
- Use the Prev/Next buttons at the bottom to navigate.

## AWT format compatibility
AWT downloads files as: `effect_<id>_<modelId>.html` (e.g., `effect_10_openai.html`).
AWT Engine Hub accepts the same filename format so you can drop in downloaded files without renaming.

## Submit an effect (via PR)
1. **Add your effect HTML** (no external assets):
   - `effects/effect_<id>_<modelId>.html`
2. **Add metadata entry** to `effects/index.json`:

```json
{
  "id": "effect_10_openai",
  "title": "Magnetic Field Lines",
  "model": "OpenAI GPT (gpt-5.2-codex)",
  "theme": "magnetic field lines with floating iron particles",
  "technique": "HTML5 Canvas 2D",
  "created_at": "2026-03-12 13:59:41",
  "html": "effects/effect_10_openai.html",
  "code": "effects/effect_10_openai.html"
}
```

3. **Open a Pull Request**.

## Rules
- Single HTML file only; no external libraries/CDNs.
- Fullscreen effect (100vw × 100vh), no scrolling.
- Keep it safe and appropriate.

## Local preview
You can open `index.html` directly, or use any static server:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000/`

## Update the Submit link
The Submit button currently points to:
```
https://github.com/sge2a/AWT-Engine-Hub/new/main/effects
```
Update it if the repo path changes.
