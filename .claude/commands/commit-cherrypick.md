---
description: Cherry-pick and Commit Specific Changes
---

## Purpose
Selectively stage and commit ONLY the changes related to a specific message or topic, filtering out unrelated modifications.

## User Input
Required message/topic: {args}

## Core Principles
- **Selective Staging**: Analyze ALL changes and identify only those related to the user's specified message
- **Conventional Commits**: Always use type prefixes (feat:, fix:, etc.)
- **Interactive Selection**: Review changes and determine which files/hunks relate to the specified topic
- **Atomic Commits**: Ensure the resulting commit is focused and represents a single logical change

## Instructions

### 1. Validate User Input
- If {args} is empty, inform the user that a message/topic is required
- Example: "Please provide a message or topic for cherry-picking: /commit-cherrypick <message>"

### 2. Analyze All Changes
Check all types of changes:
- Staged changes: `git diff --staged`
- Unstaged changes: `git diff`
- Untracked files: Read file contents directly

### 3. Identify Related Changes
For each file with changes:
- Read the actual changes (diff or file content)
- Determine if the changes relate to the user's specified message/topic
- Consider:
  - File names and paths
  - Function/class names being modified
  - Comments and documentation
  - The nature of the changes (what functionality they add/modify/fix)

### 4. Stage Related Changes
- If entire files are related: `git add <file1> <file2> ...`
- If only parts of files are related: Use `git add -p <file>` (interactive mode) or provide guidance
- List which files/changes are being staged and why they relate to the topic
- List which files/changes are being excluded and why they don't relate

### 5. Generate Commit Message
- Use the user's message as guidance for the commit subject
- Format according to Conventional Commits specification
- Infer the appropriate type (feat, fix, docs, etc.) based on the actual changes
- Add scope if applicable
- Include body explaining the changes if needed

### 6. Execute Commit
- After staging the related changes, commit immediately
- Use the generated commit message

## Commit Message Format

Follow the Conventional Commits format. For detailed specifications, see `/commit` command documentation.

**Quick reference:**
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- Subject: imperative mood, 50 chars max, lowercase, no period
- Body: optional, wrap at 72 chars
- Footer: optional, breaking changes or issue references

## Example Workflow

### User Command
```
/commit-cherrypick add user authentication
```

### Analysis Output
```
Analyzing changes for: "add user authentication"

Related changes found:
✓ src/auth/login.ts - NEW (implements login function)
✓ src/auth/jwt.ts - NEW (JWT token handling)
✓ src/types/user.ts - MODIFIED (added User interface)
✓ src/middleware/auth.ts - NEW (authentication middleware)

Unrelated changes excluded:
✗ src/ui/button.css - MODIFIED (styling changes, unrelated)
✗ README.md - MODIFIED (general documentation update)

Staging related files...
```

### Generated Commit
```
feat(auth): add user authentication system

Implement JWT-based authentication with login functionality,
token handling, and authentication middleware. Added User type
definitions to support the authentication flow.
```

## Behavior
- ALWAYS require a message/topic via {args} - stop if not provided
- ALWAYS use a type prefix (feat:, fix:, etc.) - never omit this
- **Analyze ALL changes (staged, unstaged, untracked) to find related ones**
- **Clearly explain which changes are included and which are excluded**
- If no related changes are found, inform the user
- If all changes are related, stage everything (equivalent to `/commit`)
- **Automatically proceed with commit after staging - no confirmation needed**
- Be conservative: if unsure whether a change relates, exclude it and mention it to the user
- Prioritize accuracy in identifying related changes over speed
- Default to English unless otherwise specified

## Edge Cases

### No Related Changes Found
```
No changes found related to: "add user authentication"

Available changes:
- src/ui/button.css (styling updates)
- README.md (documentation)

These don't appear to relate to the specified topic.
Would you like to commit them with a different message?
```

### Partial File Changes
```
File src/api/users.ts contains both related and unrelated changes:
- Related: getUserById() function (user authentication)
- Unrelated: updateUserProfile() function (profile management)

I recommend using `git add -p src/api/users.ts` to interactively
select only the related hunks, or splitting this into separate commits.
```

### All Changes Related
```
All current changes relate to: "add user authentication"
Staging all files and proceeding with commit...
```
