# 🧠 Moteur WebSocket Presence API

This document describes the WebSocket event APIs, payloads, and internal presence/form state contracts used in the Moteur collaboration system.

---

## ✅ Overview

- WebSocket engine is powered by **Socket.IO**
- One connection per `projectId`
- Tracks:
  - Active users
  - Cursor position
  - Screen & entry context
  - Focused fields
  - Live previews
  - Form state diffs

---

## 🟢 `join`

**Client → Server**

```ts
{
  projectId: string;
  screenId?: string;
}
```

**Server behavior:**

- Joins Socket.IO room for the project
- Registers presence with optional screen context
- Emits:
  - `presence:sync`
  - `form:sync` (if screenId is provided)

---

## 🟣 `presence:update`

**Client → Server**

```ts
{
  screenId?: string;
  entryId?: string;
  fieldPath?: string | null;
  typing?: boolean;
  textPreview?: string; // e.g. "Entered: Hello"
  cursor?: { x: number; y: number };
}
```

**Server behavior:**

- Updates presence state
- Stores parsed `textPreview` into shared `formStateStore`
- Emits:
  - `presence:change` to other users in the project room

---

## 🔴 `disconnect`

**System Event**

**Server behavior:**

- Removes user from presence store
- Clears field lock (via `fieldPath`)
- Emits:
  - `presence:change` with `{ userId, changes: null }`

---

## 📘 `presence:sync`

**Server → Client**

```ts
{
  users: Presence[];
}
```

Sent to the joining user. Contains all users currently active in the project room.

---

## 🔁 `presence:change`

**Server → All in room (except sender)**

```ts
{
  userId: string;
  changes: PresenceUpdate | null;
}
```

- `changes` is `null` if the user disconnected
- Otherwise contains updated `fieldPath`, `cursor`, `typing`, etc.

---

## 📦 `form:sync`

**Server → Client**

```ts
{
  screenId: string;
  values: Record<string, string>;
}
```

Sent to the joining user (if `screenId` is defined). Hydrates the form with the latest known edited field values.

---

## 📋 `activity:event`

**Server → All in project room**

Emitted when an activity event is logged (entry, layout, structure, model, or project created, updated, or deleted). Payload is an `ActivityEvent` (see Activity Log / REST API). Clients in the room can use this for a live activity feed.

```ts
{
  id: string;
  projectId: string;
  resourceType: 'entry' | 'layout' | 'page' | 'structure' | 'model' | 'project';
  resourceId: string;
  action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished' | 'commented' | 'resolved';
  userId: string;
  userName: string;
  fieldPath?: string;
  before?: unknown;
  after?: unknown;
  timestamp: string; // ISO
}
```

---

## 💬 Comment events

Emitted to the project room when comments are added, resolved, edited, or deleted. Clients can use these for real-time comment threads in the studio.

### `comment:added`

**Server → All in project room**

Payload: full `Comment` object (new comment).

### `comment:resolved`

**Server → All in project room**

Payload: full `Comment` object (with `resolved: true`, `resolvedBy`, `resolvedAt`).

### `comment:edited`

**Server → All in project room**

Payload: full `Comment` object (updated `body`, `updatedAt`).

### `comment:deleted`

**Server → All in project room**

Payload: `{ id: string }` (comment ID that was deleted).

---

## 🧠 Data Structures

### `Presence`

```ts
{
  userId: string;
  name: string;
  avatarUrl?: string;
  projectId: string;
  screenId?: string;
  entryId?: string;
  fieldPath?: string;
  textPreview?: string;
  typing?: boolean;
  cursor?: { x: number; y: number };
  updatedAt: number;
}
```

---

### `FormStateStore`

Internal representation of shared in-progress form edits:

```ts
Map<screenId, Map<fieldPath, value>>
```

- Only stores fields that have been edited but not saved
- Cleared manually (e.g. after save)

---

## 🛠️ Common Use Cases

| Feature                        | How it's handled                                   |
|-------------------------------|----------------------------------------------------|
| Show who's online             | `presence:sync` and `presence:change`             |
| Highlight fields in use       | Based on `Presence.fieldPath`                     |
| Show typing or selection      | `textPreview`, `typing`, `cursor`                 |
| Prevent editing conflicts     | Frontend disables inputs when `lockedBy ≠ you`    |
| Restore edits on join         | `form:sync` from `formStateStore`                 |
| Dirty check / save tracking   | `formStateStore.get(screenId).length > 0`         |
