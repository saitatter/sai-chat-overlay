module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { type: "refactor", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "chore", release: "patch" }
        ]
      }
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/github"
  ]
};
