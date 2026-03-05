# Review & Approval Workflows

This document describes Moteur’s **Review & Approval Workflow**: how to enable it, how it works, the different modes, and how it fits with the Activity Log and Comments.

---

## Overview

The workflow lets projects require that **entries are reviewed before being published**. Authors submit entries for review; users with the **reviewer** (or **admin**) role approve or reject. Approval can auto-publish the entry; rejection returns it to draft and attaches the rejection reason as a **Comment** on the entry.

- **Backend and API only** — no built-in studio UI; your frontend uses the REST API and/or Developer API.
- **Optional per project** — enable via `project.workflow` in `project.json`.
- **Integrates with** Activity Log (all actions logged), Comments (rejection reason), and Notifications (in-studio + optional email).

---

## Entry statuses

Every entry has a `status` field. It is stored on the entry JSON and defaults to `draft` when omitted.

| Status         | Meaning |
|----------------|--------|
| `draft`        | Editable, not yet submitted or returned after rejection. |
| `in_review`    | Submitted for review; waiting for approve/reject. |
| `published`    | Live; visible to public/headless API when the project exposes published content. |
| `unpublished` | Previously published, then taken down (e.g. via status change). |

Status is set by:

- **Creating/updating an entry** — you can set `status` in the payload (subject to the publish guard below).
- **Submitting for review** — sets status to `in_review`.
- **Approving a review** — in `auto_publish` mode, sets status to `published`.
- **Rejecting a review** — sets status back to `draft`.
- **PATCH entry status** — admins can set any status; non-admins are restricted when `requireReview` is enabled.

---

## Enabling the workflow

In the project’s `project.json`, add an optional `workflow` object:

```json
{
  "id": "my-project",
  "label": "My Project",
  "defaultLocale": "en",
  "workflow": {
    "enabled": true,
    "mode": "auto_publish",
    "requireReview": true
  }
}
```

| Field            | Type    | Default  | Description |
|------------------|---------|----------|-------------|
| `enabled`        | boolean | `false`  | When `true`, the review workflow is active for this project. |
| `mode`           | string  | —        | Currently only `auto_publish` (approve → entry becomes `published`). |
| `requireReview`  | boolean | —        | When `true`, **non-admin** users cannot set an entry to `published` unless it has an **approved** review. Admins can always set status directly. |

If `workflow` is missing or `workflow.enabled` is `false`, the project behaves as before: no submit/approve/reject, and no publish guard.

---

## Workflow modes

### `auto_publish` (current)

- Author (or any project member) **submits** an entry for review → entry status becomes `in_review`, a **Review** record is created with status `pending`.
- A user with **reviewer** or **admin** role **approves** the review → the Review is resolved as `approved`, and the entry status is set to **`published`**.
- A reviewer/admin **rejects** the review → the Review is resolved as `rejected`, a **Comment** is created on the entry with the rejection reason, and the entry status is set back to **`draft`**. The Comment ID is stored on the Review as `rejectionCommentId`.

Other modes (e.g. manual publish after approval) may be added later; the API is designed so new modes can be supported without breaking existing behaviour.

---

## Roles and who can do what

| Role      | Where it’s defined | Submit for review | Approve / Reject | Publish without approval |
|-----------|--------------------|-------------------|------------------|---------------------------|
| (any)     | Project member     | Yes               | No               | Only if no `requireReview` or has approved review |
| `reviewer`| `users.json` `roles` | Yes            | Yes              | No (still subject to publish guard unless admin) |
| `admin`   | `users.json` `roles` | Yes            | Yes              | Yes (bypasses publish guard) |

- **Submit for review**: any user who can access the project and the entry can submit.
- **Approve / Reject**: only users whose `roles` array includes `reviewer` or `admin` (in global `users.json`).
- **Publish without approval**: when `workflow.requireReview` is `true`, only **admins** can set an entry to `published` without an approved review. Non-admins get a 403 if they try (e.g. via PATCH entry or PATCH status).

To grant reviewer rights, add `"reviewer"` to the user’s `roles` in `data/users.json`:

```json
{
  "id": "jane",
  "name": "Jane",
  "email": "jane@example.com",
  "roles": ["reviewer"],
  "projects": ["my-project"],
  "isActive": true
}
```

---

## The flow step by step

1. **Author edits an entry** (status can be `draft` or anything else).
2. **Author (or someone) submits for review**  
   - API: `POST .../entries/:id/submit-review` (optional body: `{ "assignedTo": "userId" }`).  
   - Entry status → `in_review`.  
   - A new **Review** is created with `status: 'pending'`.  
   - Activity: `submitted_for_review`.  
   - Notifications: reviewers (or `assignedTo`) get “review requested”; optional email if configured.
3. **Reviewer opens the entry/review** and either:
   - **Approves**  
     - API: `POST .../reviews/:reviewId/approve`.  
     - Entry status → `published` (in `auto_publish` mode).  
     - Review → `approved`, `resolvedAt` set.  
     - Activity: `approved`.  
     - Requester gets a notification (and optional email).
   - **Rejects**  
     - API: `POST .../reviews/:reviewId/reject` with body `{ "reason": "..." }`.  
     - A **Comment** is created on the entry with that reason; its ID is stored in `Review.rejectionCommentId`.  
     - Entry status → `draft`.  
     - Review → `rejected`, `resolvedAt` set.  
     - Activity: `rejected`.  
     - Requester gets a notification (and optional email).
4. **If rejected**, the author can fix the entry and **submit for review again** (step 2). Only one **pending** review per entry at a time.

---

## Publish guard

When **`workflow.enabled`** and **`workflow.requireReview`** are both `true`:

- Any attempt to set an entry’s status to **`published`** (via PATCH entry or PATCH status) is allowed only if:
  - the user is an **admin**, or  
  - the entry has **at least one approved Review**.
- Otherwise the API returns **403** with a message that publishing requires an approved review.

When `workflow.enabled` is `false` or `requireReview` is `false`, there is no guard: existing behaviour (direct status updates) is unchanged.

---

## Notifications

### In-studio notifications

- Stored per project in **`notifications.json`**.
- **When an entry is submitted for review**: all users with the **reviewer** role (or the optional `assignedTo` user) receive a `review_requested` notification.
- **When a review is approved or rejected**: the user who submitted (`requestedBy`) receives an `approved` or `rejected` notification.

API: `GET .../notifications`, `POST .../notifications/:id/read`, `POST .../notifications/read-all`. See [REST API](REST%20API.md) and [Developer API](Developer%20API.md).

### Email (optional)

- Configured via environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- If **nodemailer** is installed and SMTP is configured, the same events (review requested, approved, rejected) trigger plain-text emails to the relevant users.
- Email is **non-blocking** and **fail-safe**: send failures are caught and optionally logged to the Activity Log; they never fail the request.

---

## Activity Log and Comments

- **Activity Log**: Every workflow action is logged (`submitted_for_review`, `approved`, `rejected`) with the usual fields (resourceType `entry`, resourceId `modelId__entryId`, userId, timestamp, etc.). See [REST API – Activity Log](REST%20API.md).
- **Comments**: Rejection uses the existing Comments system. The rejection reason is stored as a Comment on the entry (`resourceType: 'entry'`, `resourceId: modelId__entryId`). The Review stores that Comment’s ID in `rejectionCommentId` so the studio can link “rejected” to the thread.

---

## Real-time (WebSocket)

When the workflow is used, the Presence/WebSocket server emits to the **project room**:

- `review:submitted` — payload: full Review.
- `review:approved` — payload: full Review.
- `review:rejected` — payload: full Review (includes `rejectionCommentId`).
- `review:status_changed` — payload: `{ entryId, modelId, status }`.

See [Presence API](Presence%20API.md).

---

## API quick reference

| Action           | REST | Developer API |
|------------------|------|----------------|
| Submit for review | `POST .../entries/:id/submit-review` | `Moteur.reviews.submit(projectId, user, modelId, entryId, assignedTo?)` |
| List reviews     | `GET .../reviews?modelId=&entryId=&status=` | `Moteur.reviews.get(projectId, options?)` |
| Get one review   | `GET .../reviews/:reviewId` | `Moteur.reviews.getOne(projectId, reviewId)` |
| Approve          | `POST .../reviews/:reviewId/approve` | `Moteur.reviews.approve(projectId, user, reviewId)` |
| Reject           | `POST .../reviews/:reviewId/reject` body `{ reason }` | `Moteur.reviews.reject(projectId, user, reviewId, reason)` |
| Set entry status | `PATCH .../entries/:id/status` body `{ status }` | (use entries update with `status` in payload) |

All REST endpoints require JWT and project access. Approve/reject require **reviewer** or **admin** role (403 otherwise).  
Full details: [REST API](REST%20API.md), [Developer API](Developer%20API.md).

---

## Summary

| Topic            | Summary |
|------------------|--------|
| **Enable**       | Set `workflow.enabled: true` (and optionally `requireReview: true`) in `project.json`. |
| **Mode**         | Only `auto_publish`: approve → entry becomes `published`. |
| **Roles**        | `reviewer` or `admin` (in `users.json`) to approve/reject; only admins bypass the publish guard when `requireReview` is true. |
| **Statuses**     | `draft` → `in_review` (submit) → `published` (approve) or back to `draft` (reject). |
| **Rejection**    | Stored as a Comment on the entry; `Review.rejectionCommentId` links to it. |
| **Guard**        | When `requireReview` is true, non-admins need an approved review to set `published`. |
