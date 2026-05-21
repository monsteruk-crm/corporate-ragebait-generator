# Post Elements Specification

Last updated: 2026-05-21

## Purpose

Define each generated post field used by LinkedIn Ragebait Forge and how it appears in the UI/share flow.

## Elements

### `authorName`

- Type: `string`
- Meaning: Fictional person name shown as post author.
- UI usage: Top of preview card beside avatar.
- Rule: Must not be a real person identity.

### `authorTitle`

- Type: `string`
- Meaning: Fictional job title and company context.
- UI usage: Under `authorName` in preview card.
- Rule: Must be fictional and satirical.

### `headline`

- Type: `string`
- Meaning: Main attention-grabbing ragebait hook.
- UI usage: Large uppercase heading in preview card.
- Rule: Dramatic parody tone; no real-world defamatory allegations.

### `body`

- Type: `string`
- Meaning: Main post text expanding the headline.
- UI usage: Paragraph under headline.
- Rule: Satirical absurdity, no real targeted harm claims.

### `hashtags`

- Type: `string[]`
- Meaning: Topical tags that mimic LinkedIn trend-chasing.
- UI usage: Rendered as space-separated hashtag line.
- Rule: Each item should start with `#`.

### `reactionCount`

- Type: `number`
- Meaning: Fake engagement reactions metric.
- UI usage: Stats row in preview card.

### `commentCount`

- Type: `number`
- Meaning: Fake comments metric.
- UI usage: Stats row in preview card.

### `repostCount`

- Type: `number`
- Meaning: Fake repost/share metric.
- UI usage: Stats row in preview card.

### `imagePrompt`

- Type: `string`
- Meaning: Suggested text prompt for support image generation.
- UI usage:
  - Shown in editable multi-line text area.
  - Can be regenerated with `Regenerate Prompt`.
  - Submitted by `Generate Support Image`.

### `supportImage` (runtime-only UI value)

- Type: `string | null` (data URL)
- Meaning: Generated image displayed with the post.
- UI usage: Replaces image placeholder area in preview card once generated.

## Share Flow Mapping

When user clicks **Share on LinkedIn**, copied text includes:

1. `authorName` + `authorTitle`
2. `headline`
3. `body`
4. `hashtags` joined by spaces

The support image is previewed in-app only for MVP and is not auto-posted.
