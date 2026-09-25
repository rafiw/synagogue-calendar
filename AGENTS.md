# AGENTS

## Critical Guidelines & Rules

### Backward Compatibility (Mandatory)
- **Always Maintain Backward Compatibility with Stored JSON**: Newer versions of the app will frequently encounter older JSON structures (from local `AsyncStorage`, GitHub Gist sync, or exported files).
- **Optional Fields & Safe Fallbacks**: Any new fields or properties added to existing data structures (e.g., `Settings`, `Message`, `Class`, etc.) must be optional (`?`) in TypeScript and have safe fallback defaults when reading from storage.
- **Never Break Existing Schemas**: Do not remove, rename, or change the expected types of existing fields in saved models without backwards-compatible parsing / migration fallbacks.
- **Defensive Data Handling**: Always handle missing, `null`, or `undefined` arrays and nested objects defensively (e.g., `messages || []`, `msg.type || 'standard'`).
