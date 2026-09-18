# Whiteboard — Design

## Context

The workspace already has a full-featured `Canvas` module (shapes, sticky notes,
pencil, text, images, grouping, zoom/pan, grid/snap — backed by Konva and a
per-object Prisma model). This spec is **not** about Canvas. It defines a new,
separate, lightweight `Whiteboard` module: a quick freehand doodle/scribble
surface, standalone (own workspace-level list + route, like Canvas/Mindmap),
with a much smaller toolset and a simpler persistence model.

Non-goal reminder: this does not address Canvas's lack of real-time
multiplayer sync (`AppGateway` currently only handles `joinWorkspace` /
`leaveWorkspace`, no object broadcasting). That's a separate concern for
Canvas, out of scope here.

## Toolset

- Pencil (freehand strokes) — core
- Eraser — whole-stroke removal (pointer-drag hit-test, not pixel-level erase)
- Color picker + stroke-width control
- Undo / redo (capped history, ~50 steps)
- Clear board (with confirm)
- Text tool — drop simple text labels

Explicitly excluded: shape library (rectangle/ellipse/arrow/line), sticky
notes, image embedding, grouping, per-object rotation/scale, zoom
persistence, export (PNG/PDF), pixel-level erasing, real-time multiplayer
sync.

## Data model

Single new Prisma model. No per-element table — the whole board is one JSON
blob, matching the "lightweight" scope (contrast with Canvas's per-object
`CanvasObject` rows):

```prisma
model Whiteboard {
  id          String   @id @default(uuid())
  title       String   @default("Untitled Whiteboard")
  workspaceId String   @map("workspace_id")
  createdById String   @map("created_by_id")
  data        Json     @default("[]")   // array of elements (strokes + text)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdBy User      @relation("WhiteboardAuthor", fields: [createdById], references: [id])

  @@index([workspaceId])
  @@map("whiteboards")
}
```

`data` holds a flat array of elements, drawn in array order (later = on top):

```ts
{ kind: 'stroke'; id: string; points: number[]; color: string; width: number }
{ kind: 'text'; id: string; x: number; y: number; text: string; color: string; fontSize: number }
```

Add the inverse relation on `User` (`whiteboards Whiteboard[] @relation("WhiteboardAuthor")`)
and `Workspace` (`whiteboards Whiteboard[]`), matching the existing
`CanvasAuthor` / `MindmapAuthor` pattern.

## Backend API

New NestJS module: `services/src/whiteboard/{whiteboard.module,controller,service,dto}.ts`,
following the `canvas` module's structure but thinner (no object sub-routes):

```
POST   /whiteboard                          create { workspaceId, title? }
GET    /whiteboard/workspace/:workspaceId   list (id, title, timestamps — no data payload)
GET    /whiteboard/:id                      full record including data
PATCH  /whiteboard/:id                      update { title?, data? }  ← autosave hits this
DELETE /whiteboard/:id
```

- `data` validated as `@IsArray()` only — same latitude `CanvasObject.props`
  gets today; per-element-shape validation isn't worth it for a blob like
  this.
- Same `assertWorkspaceAccess` pattern as `CanvasService`: workspace
  membership required for all routes, `VIEWER` role blocked from
  create/update/delete.
- Register `WhiteboardModule` in the root app module alongside
  `CanvasModule`/`MindmapModule`.

## Frontend architecture

New `ui/src/modules/whiteboard/`, mirroring the Canvas module's file layout:

- **`store.ts`** (Pinia) — `whiteboards` (list), `currentWhiteboard`, loading
  state. Actions: `fetchWhiteboards`, `fetchWhiteboard`, `createWhiteboard`,
  `updateWhiteboard` (title and/or data), `deleteWhiteboard`. Same shape as
  `useCanvasStore`.
- **`composables/useWhiteboard.ts`** — owns the in-memory `elements` array,
  active tool (`pencil | eraser | text`), color, stroke width, and an
  undo/redo stack (snapshot-based, capped ~50 steps). Marks `dirty` on
  change, which drives autosave.
- **`components/WhiteboardStage.vue`** — Konva `<v-stage>` (via `vue-konva`,
  already a dependency). Renders `elements` as `<v-line>` (strokes) /
  `<v-text>` (text). Captures pointer events to build a new stroke's
  `points` array while the pencil tool is active — same free-draw pattern
  Canvas's `PENCIL` object type already uses.
- **`components/WhiteboardToolbar.vue`** — pencil/eraser/text tool buttons,
  color swatch, width slider, undo/redo, clear-board (with confirm dialog).
- **`views/WhiteboardView.vue`** — page shell: toolbar + stage, loads by
  route param, shows a save-state indicator ("Saving…" / "Saved").

**Autosave**: `useWhiteboard` watches `elements`, debounces 1.5s after the
last change, then calls `store.updateWhiteboard(id, { data: elements })`.
Also flushes on `beforeRouteLeave` and `beforeunload` so in-flight edits
aren't lost on navigation/close.

**Eraser**: pointer-drag hit-tests strokes under the cursor and removes the
whole stroke from `elements`. No pixel-partial erasing — keeps the
implementation trivial and matches the "lightweight" framing.

## Integration points

- **Router** (`ui/src/router/index.ts`): new route
  `workspace/:workspaceId/whiteboard/:whiteboardId` → `WhiteboardView.vue`,
  following the existing `canvas`/`mindmap` route entries exactly.
- **`AppSidebar.vue`**: new collapsible "Whiteboards" section next to
  Canvases/Mindmaps — list, create button, active-item highlighting. Same
  pattern as the existing Canvas/Mindmap sections.
- **`WorkspaceView.vue`**: new "Whiteboards" tab alongside Canvases/Mindmaps,
  with a card grid and "New Whiteboard" / "Create First Whiteboard" empty
  state, copied from the existing Canvas tab block.
- **Delete-workspace confirmation copy**: update to mention whiteboards
  alongside "documents, canvases, and mindmaps."
- No changes to `AppGateway` or any other existing module.

## Testing

- Backend: service-level tests for `WhiteboardService` covering
  workspace-access enforcement (member required, `VIEWER` blocked from
  writes) and basic CRUD, following existing test patterns for
  `CanvasService`/`MindmapService` if present.
- Frontend: composable-level tests for `useWhiteboard`'s undo/redo stack and
  eraser hit-testing logic, since those are the only non-trivial pieces of
  client logic.

## Out of scope

- Real-time multiplayer sync (a pre-existing gap in Canvas too; not
  addressed here)
- Shape library, sticky notes, image embedding, grouping, per-object
  rotation/scale, zoom persistence
- Export (PNG/PDF)
- Pixel-level/partial erasing
