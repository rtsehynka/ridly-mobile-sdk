#!/bin/bash

# RIDLY Mobile SDK - Public Release Script
# This script creates a clean public release without premium content

set -e

echo "Creating public release branch..."

# Create a temporary branch for public release
git checkout -b public-release-temp

# Remove premium content from git (not from disk)
git rm -rf --cached themes/ plugins/ 2>/dev/null || true

# Commit the removal
git commit -m "Prepare public release" --allow-empty

# Push to public remote
echo "Pushing to public repository..."
git push public public-release-temp:main --force

# Return to main branch
git checkout main

# Delete temporary branch
git branch -D public-release-temp

# Restore premium content to git tracking
git checkout -- .

echo "Public release complete!"
echo "Public repo: https://github.com/rtsehynka/ridly-mobile-sdk"
