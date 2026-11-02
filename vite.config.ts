
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Preserve the existing server entry.
    server: { entry: "server" },
  },
  vite: {
    // Use Vite's native TypeScript path resolution.
    resolve: { tsconfigPaths: true },
  },
});
