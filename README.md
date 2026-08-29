# Plumb Line

**Repository:** Rooted_Guide (historical working title)  
**Application:** Plumb Line

Plumb Line is a minimal, personal Bible-study guide centered on a blinking cursor. The name is inspired by the biblical image of a plumb line as a standard for alignment, truth, examination, and faithful direction.

The cursor is the front door. Scripture is the ground truth. Conversation is the navigation.

## Rebuild workflow

The complete staged instructions are in [`rooted-rebuild-claude-code-prompts.md`](./rooted-rebuild-claude-code-prompts.md).

Run **one numbered prompt at a time** in Claude Code, beginning with Prompt 1. Complete each stage's exit gate and review Claude's report before continuing. Do not paste all ten implementation prompts at once.

The legacy [`Rooted_Daily`](https://github.com/Mattjhagen/Rooted_Daily) repository is reference material only. The new app should selectively port validated data and small domain concepts without inheriting its screens, navigation, community system, credential patterns, or overall architecture.

## Documentation

- [Product Vision](./docs/product-vision.md) — Core product identity, onboarding strategy, design principles, and boundaries
- [Rebuild Audit](./docs/rebuild-audit.md) — Legacy repository audit and architecture decisions
- [Bible Corpus Audit](./docs/bible-corpus-audit.md) — Translation provenance, licensing, and integrity verification
- [Staged Rebuild Prompts](./rooted-rebuild-claude-code-prompts.md) — Complete implementation sequence

## Current status

**Prompt 1:** ✅ Clean-room boundary established  
**Prompt 2:** ✅ Fresh foundation with vertical slice  
**Prompt 3A:** ✅ Bible corpus audit (engwebp approved)  
**Prompt 3B:** ⏳ Next — SQLite Bible repository implementation

Application implementation is in progress following the staged prompt sequence.
