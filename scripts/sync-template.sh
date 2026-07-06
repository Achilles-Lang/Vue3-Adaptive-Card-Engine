#!/bin/bash
# sync-template.sh
# Sync changes from examples/basic to the template branch after each release.
#
# Usage: bash scripts/sync-template.sh
# Requires: git, and template branch exists.

set -e

echo "Syncing examples/basic to template branch..."

# Check if we're on main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "Error: This script must be run from the main branch."
  exit 1
fi

# Ensure template branch exists, or create it
if ! git show-ref --verify --quiet "refs/heads/template"; then
  echo "Creating template branch..."
  git checkout -b template main
  git checkout main
fi

# Copy the basic example contents
git checkout template
git checkout main -- examples/basic

# Move everything from examples/basic to root
cp -r examples/basic/* .
rm -rf examples/ packages/

# Replace workspace protocol with npm version in package.json
sed -i 's/"vue3-adaptive-card-engine": "workspace:\*"/"vue3-adaptive-card-engine": "^1.0.0"/' package.json

# Commit and push
git add -A
git commit -m "chore: sync template from examples/basic" || echo "No changes to commit"
git push origin template

# Back to main
git checkout main

echo "Template branch synced successfully!"
