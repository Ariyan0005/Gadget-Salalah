---
name: Imported workspace validation
description: Validation guidance for repositories imported into the Replit pnpm workspace
---

When importing an existing pnpm monorepo, install the target app and the workspace libraries it actually depends on before validating. Generated client source can be current while its emitted declarations are stale, so run the library typecheck/build step before checking the app.

**Why:** A full frozen install can be blocked by an unrelated code-generation dependency, while a filtered install is sufficient for the app. Stale project-reference declarations can otherwise make valid generated hooks appear missing.

**How to apply:** Preserve the imported repository's Git metadata, use filtered installs for the target app and required libraries, then run the workspace library typecheck followed by the app typecheck/build.