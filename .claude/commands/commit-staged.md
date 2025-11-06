---
description: Git Commit for Staged Changes Only
---

## Purpose
Generate commit messages and commit ONLY the currently staged changes, without analyzing or staging additional files.

## Core Principles
- **Work with staged changes only**: Never analyze unstaged changes or suggest staging additional files
- **Conventional Commits**: Always use type prefixes (feat:, fix:, etc.)
- **Direct commit**: Skip analysis and proceed directly with committing staged changes

## Instructions
1. Check what changes are currently staged using `git diff --staged`
2. If no changes are staged, inform the user and stop
3. If changes are staged:
   - Analyze ONLY the staged changes
   - Generate an appropriate commit message following Conventional Commits
   - Commit immediately without asking for confirmation

## Commit Message Format

Follow the Conventional Commits format. For detailed specifications, see `/commit` command documentation.

**Quick reference:**
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- Subject: imperative mood, 50 chars max, lowercase, no period
- Body: optional, wrap at 72 chars
- Footer: optional, breaking changes or issue references

**Example:**
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
by preventing sudden logouts. The refresh happens 5 minutes
before token expiration.

Closes #234
```

## Behavior
- ALWAYS use a type prefix (feat:, fix:, etc.) - never omit this
- **Only analyze and commit staged changes - ignore unstaged changes completely**
- **Automatically proceed with commit without asking for confirmation**
- If no staged changes exist, inform the user and stop
- Prioritize clarity and context over brevity
- Default to English unless otherwise specified
- Each commit should be independently understandable and revertable
