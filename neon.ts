import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,

  // S3-compatible object storage for user uploads (activity media, menu photos).
  // public_read: anyone can read an object by URL; writes require the injected
  // AWS_* credentials, so uploads still go through the authenticated API route.
  // Buckets are branch-scoped — this provisions on whichever branch is linked.
  buckets: {
    uulzy: { access: "public_read" },
  },

  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
