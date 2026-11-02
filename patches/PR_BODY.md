Title: fix: normalize paths in MCP Vite plugin for Windows

Summary

This patch normalizes filesystem paths to POSIX-style before performing containment checks in the MCP Vite plugin. On Windows the plugin's string containment logic fails because paths use backslashes, causing dev-server startup errors like:

  Error: @lovable.dev/mcp-js: routesDir "src/routes" must resolve under C:/Users/... , got C:\Users\...\src\routes

What I changed

- Normalize `parent` and `child` paths using `path.sep` replacement (replace `\\` with `/`) before doing `startsWith` checks.
- The change is minimal and purely defensive; it doesn't affect POSIX systems.

Why

The plugin assumes POSIX-style separators when checking whether a given path is contained under a project root. On Windows this leads to false negatives and prevents the dev server from starting. Normalizing paths removes the platform-specific discrepancy.

Testing

- Manual: Verified locally by running the dev server in a Windows environment; the previous assert error no longer occurs and Vite starts.
- Unit: Recommend adding a small unit test that feeds Windows-style paths to `assertContains` and ensures no error is thrown.

Suggested PR checklist

- [ ] Add unit test for Windows path behavior
- [ ] Run existing test suite
- [ ] Confirm no regressions on Linux/macOS
- [ ] Update changelog

Notes for maintainers

- This is a small defensive fix; if we refactor path handling in the plugin later, keep normalization in mind.
- The repo currently had a local workaround in the downstream project; this upstream fix removes the need for that.

Patch file location

See: `patches/0001-normalize-paths-mcp-js.patch`

Reviewer suggestions

- @lovable-dev/core
- @lovable-dev/plugin-maintainers

