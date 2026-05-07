// .eslintrc.boundaries.js
// Enforces INVARIANT_011: packages/safety-core must have zero forbidden imports.
// This runs in CI and blocks merge on violation.

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          // No browser APIs
          { group: ["react", "react-dom", "react/*"], message: "INVARIANT_011: safety-core must not import React or any browser library." },
          // No Next.js / framework imports
          { group: ["next", "next/*"], message: "INVARIANT_011: safety-core must not import Next.js." },
          // No Node.js-specific modules
          { group: ["fs", "path", "crypto", "os", "child_process", "http", "https", "net", "stream", "buffer", "process"], message: "INVARIANT_011: safety-core must not import Node.js built-ins." },
          // No other workspace packages
          { group: ["@uicare-hui/pwa*", "@uicare-hui/experimental*"], message: "INVARIANT_011: safety-core must not import from apps or other workspace packages." },
          // No IndexedDB or storage libraries
          { group: ["idb", "localforage", "dexie"], message: "INVARIANT_011: safety-core must not import storage infrastructure." },
          // No date libraries
          { group: ["date-fns", "dayjs", "moment", "luxon"], message: "INVARIANT_011: safety-core must not import date libraries. Inject a Clock port." }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ["packages/safety-core/src/**/*.ts"],
      // Apply all restrictions above
    }
  ]
};
