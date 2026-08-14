---
name: open-code-review
description: >
  Performs a thorough code review on all project files. Use when the user
  asks to review code, check for bugs, security vulnerabilities, performance
  problems, or code quality. Produces line-level review comments grouped by
  priority. Works WITHOUT an external LLM API key by running the review
  directly as the agent.
metadata:
  author: adapted-for-agent
  version: "1.0.0"
---

# Open Code Review (Agent-Native Mode)

This skill runs a full code review WITHOUT requiring an external OCR CLI or
API key. The agent IS the reviewer. Follow these exact steps:

## Step 1: Discover All Source Files

Use `list_dir` recursively to enumerate every non-trivial file under the
project root. Exclude: `node_modules`, `.next`, `.git`, `public/`, `*.lock`.

## Step 2: Read Every File

For each discovered file, use `view_file` to read its full contents.
Cover at minimum:
- `app/**/*.tsx` and `app/**/*.ts` (pages, layouts, API routes)
- `lib/**/*.ts` (utilities, cache, clients, queries)
- `components/**/*.tsx` (UI components)
- `middleware.ts`
- `next.config.ts`
- `*.env.example`

## Step 3: Apply the Following Review Criteria

Act as a senior engineer. For every file, check ALL of the following:

### 🔴 HIGH Priority (must flag)
1. **Security**: hardcoded secrets, tokens, passwords in code (not in env vars)
2. **Security**: `error: any` in catch blocks — use `unknown` instead
3. **Security**: missing auth checks on admin/protected routes
4. **Security**: SQL/NoSQL injection risks
5. **Resilience**: `Promise.all` where `Promise.allSettled` should be used
6. **Resilience**: missing `try/catch` around external API calls
7. **Correctness**: unhandled `null`/`undefined` dereferences

### 🟡 MEDIUM Priority (flag and suggest fix)
1. **Performance**: N+1 database queries (loop that fetches individually)
2. **Performance**: missing `cache: 'no-store'` on sensitive API fetches
3. **Code Quality**: `any` type used where specific type is possible
4. **Code Quality**: dynamic `import()` inside request handlers (should be static)
5. **SEO**: missing `generateMetadata` on public-facing pages
6. **SEO**: missing JSON-LD schema on product pages
7. **Caching**: missing `Cache-Control` headers on public API endpoints

### 🔵 LOW Priority (mention but don't block)
1. Unused imports or variables
2. Inconsistent naming conventions
3. Missing comments on complex logic

## Step 4: For Each Issue Found, Report This Format

```
### [PRIORITY] — `path/to/file.ts` | Line X
**Issue**: One-sentence description
**Current code**:
  [show the problematic snippet]
**Recommendation**:
  [show the fix]
**Status**: [Fixed / Needs Manual Fix / Documentation Only]
```

## Step 5: Apply Automatic Fixes

For every HIGH priority issue and safe MEDIUM issues, apply the fix directly
using `multi_replace_file_content` or `replace_file_content`.

## Step 6: Write Report File

Write a comprehensive report file named `تقارير.md` in the project root
containing all 5 review categories:
1. Security Review
2. Performance Review
3. Code Quality Review
4. SEO & Architecture Review
5. Resilience & Maintainability Review

Use the exact format shown in Step 4 for every issue.

## Step 7: Commit and Push

Run: `git add . && git commit -m "review: open-code-review findings and fixes" && git push`
