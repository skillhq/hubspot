# Agent Instructions

## Releasing

When releasing a new version:

1. **Always ask the user** which version bump they want:
   - `patch` (0.0.x) - Bug fixes, small changes
   - `minor` (0.x.0) - New features, backward compatible
   - `major` (x.0.0) - Breaking changes

2. **Release process:**
   ```bash
   npm version <patch|minor|major>
   git push && git push --tags
   ```

3. The GitHub Actions workflow will automatically publish to npm when a `v*` tag is pushed.

## CI/CD

- **CI** runs on every push/PR to `main` - builds and validates
- **Publish** runs on version tags (`v*`) - publishes to npm with provenance
