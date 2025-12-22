#!/bin/bash
set -e

PACKAGE_NAME=$1
VERSION=$2

if [ -z "$PACKAGE_NAME" ] || [ -z "$VERSION" ]; then
  echo "❌ Error: Package name and version are required"
  echo "Usage: release.sh <package-name> <version>"
  exit 1
fi

echo "📦 Releasing ${PACKAGE_NAME} v${VERSION}..."

git add package.json
git commit -m "${PACKAGE_NAME}-v${VERSION}"
git tag "${PACKAGE_NAME}-v${VERSION}"
git push origin main
git push origin "${PACKAGE_NAME}-v${VERSION}"
npm publish --access public

echo "✅ Successfully released ${PACKAGE_NAME} version ${VERSION}!"
