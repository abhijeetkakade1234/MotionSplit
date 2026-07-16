# MotionSplit

Client-side video to image-sequence extractor for developer animation workflows.

## What it does

- Accepts `mp4`, `mov`, and `webm`
- Extracts every frame or a chosen FPS
- Exports PNG or JPG frames into a ZIP
- Runs fully in the browser with `ffmpeg.wasm`
- Supports installable PWA behavior for local/offline use

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- `ffmpeg.wasm`
- JSZip

## Local development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

## Notes

- No backend
- No cloud upload
- No login
- Video processing stays on-device
