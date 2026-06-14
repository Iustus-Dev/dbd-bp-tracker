# AI Agent Guidelines (GEMINI.md)

This document defines the foundational mandates for all AI agents working on the `dbd-bp-tracker` project. These rules take absolute precedence over default behaviors.

## 1. Branch Management & Safety
- **PROTECTED BRANCH:** The `main` branch is considered "production/live". **NEVER** push directly to `main`.
- **WORKING BRANCH:** All development MUST happen on the `dev` branch or feature-specific branches derived from `dev`.
- **DEPLOYMENT:** Changes move from `dev` to `main` ONLY via verified Pull Requests or explicit user instruction.

## 2. Workflow Mandates
AI agents must strictly follow the **Research -> Strategy -> Execution** lifecycle:
1. **Research:** Map the codebase, validate assumptions, and reproduce any reported bugs before attempting a fix.
2. **Strategy:** Present a concise plan for approval before executing complex changes.
3. **Execution:** 
   - Perform surgical, minimal edits.
   - Adhere strictly to existing code style (React, Vite, ESLint).
   - **Validation is mandatory:** Every change MUST be verified with tests or manual validation scripts.

## 3. Engineering Standards
- **Testing:** If a feature is added or a bug is fixed, a corresponding test case (or verification step) must be provided.
- **Error Handling:** Code must be robust and include proper error boundaries and logging.
- **Dependencies:** Do not add new packages without verifying necessity and compatibility.

## 4. Communication & Transparency
- **Explain Before Acting:** Always state the intent and technical rationale before executing commands.
- **No Hidden Changes:** Do not perform "cleanup" or refactoring outside the requested scope unless it is critical for the task.
- **Security:** Never log or commit secrets, API keys, or environment variables.

## 5. Structured Output
- Maintain high-signal communication.
- Be concise and direct.
- Prioritize project stability over speed.
