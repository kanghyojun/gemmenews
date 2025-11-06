  ---
  description: Git Commit Message Generator
  ---

## Purpose
Analyze staged changes and generate well-structured, atomic commit messages following the Conventional Commits specification.

## User Input
User provided message: {args}

## Core Principles
- **Atomic Commits**: Each commit should represent a single logical change
- **Conventional Commits**: Always use type prefixes (feat:, fix:, etc.)
- If staged changes contain multiple unrelated modifications, suggest splitting them into separate atomic commits

## Instructions
1. Check git status first to see staged changes, unstaged changes, AND untracked files
2. Review ALL changes:
   - Staged changes: `git diff --staged`
   - Unstaged changes: `git diff`
   - Untracked files: Read the file contents directly to understand what's being added
3. Analyze ALL changes (staged + unstaged + untracked) to understand:
   - What functionality was added, modified, or removed
   - Which files and modules were affected
   - The scope and impact of changes
   - Whether changes are logically related or should be split
4. **If user provided a message (via {args})**:
   - Use the user's message as guidance for understanding the intent of the changes
   - Still analyze the actual changes to ensure the message matches what was changed
   - Format the user's message into proper Conventional Commits format if needed
   - If the user's message doesn't match the actual changes, politely correct it
   - Stage all relevant files and commit with the properly formatted message
5. **If no user message provided**:
   - If changes are not atomic (mixing multiple concerns):
     - MUST suggest splitting into separate commits with specific file patterns for each
     - Provide exact `git add` commands for staging each atomic commit
   - If changes represent a single atomic commit:
     - Stage all relevant files (including untracked files) with appropriate `git add` command
     - Generate commit message following Conventional Commits specification
     - Proceed with the commit automatically

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (REQUIRED - Always include a prefix)
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without functionality change
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD configuration changes

### Scope (optional)
- Component, module, or file affected
- Examples: `api`, `auth`, `ui`, `database`

### Subject
- Concise summary (50 characters or less)
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- Lowercase first letter

### Body (optional)
- Detailed explanation of what and why (not how)
- Wrap at 72 characters
- Separate from subject with a blank line

### Footer (optional)
- Breaking changes: `BREAKING CHANGE: <description>`
- Issue references: `Closes #123`, `Fixes #456`

## Example Output

### Single Atomic Commit
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
by preventing sudden logouts. The refresh happens 5 minutes
before token expiration.

Closes #234
```

### Multiple Atomic Commits Suggestion
```
The staged changes contain multiple unrelated modifications.
I recommend splitting into these atomic commits:

1. feat(auth): add JWT token refresh mechanism
   Files: src/auth/tokenService.js, src/auth/refreshToken.js

2. fix(ui): correct button alignment in login form
   Files: src/components/LoginForm.css

3. docs(readme): update installation instructions
   Files: README.md

Would you like me to generate detailed commit messages for each?
```

## Behavior
- ALWAYS use a type prefix (feat:, fix:, etc.) - never omit this
- **When user provides a message via {args}**:
  - Use it as the basis for the commit message
  - Ensure it follows Conventional Commits format (add type prefix if missing)
  - Verify the message matches the actual changes
  - Automatically proceed with staging and commit
- **When no message is provided**:
  - If changes mix multiple concerns, MUST suggest splitting into atomic commits with exact `git add` commands
  - If changes represent a single atomic commit, automatically proceed with staging (if needed) and commit without asking for confirmation
- If no changes exist at all (staged, unstaged, or untracked), inform the user
- MUST review untracked files by reading their contents - they are legitimate changes that need to be committed
- Prioritize clarity and context over brevity
- Default to English unless otherwise specified
- Each commit should be independently understandable and revertable
