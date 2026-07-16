#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
#  TypeStrike — Build Script (macOS / Linux)
#  Creates a standalone executable using Node.js SEA
# ──────────────────────────────────────────────

OUTPUT_NAME="${1:-typestrike}"

echo ""
echo "  ╺┳╸╻ ╻┏━┓┏━╸┏━┓╺┳╸┏━┓╻╻┏ ┏━╸"
echo "   ┃ ┗┳┛┣━┛┣╸ ┗━┓ ┃ ┣┳┛┃┣┻┓┣╸"
echo "   ╹  ╹ ╹  ┗━╸┗━┛ ╹ ╹┗╸╹╹ ╹┗━╸"
echo ""
echo "  Building standalone executable..."
echo ""

# Ensure dist directory exists
mkdir -p dist

# Step 1: Bundle all source into a single file
echo "  [1/4] Bundling with esbuild..."
npx -y esbuild sea-entry.js --bundle --platform=node --format=cjs --outfile=dist/typestrike-bundle.cjs --minify
echo "  Done! (dist/typestrike-bundle.cjs)"
echo ""

# Step 2: Generate SEA blob
echo "  [2/4] Generating SEA blob..."
node --experimental-sea-config sea-config.json
echo "  Done! (dist/typestrike.blob)"
echo ""

# Step 3: Copy node binary
echo "  [3/4] Copying Node.js binary..."
NODE_PATH="$(which node)"
cp "$NODE_PATH" "dist/${OUTPUT_NAME}"

# On macOS, remove the existing code signature before injection
if [[ "$(uname)" == "Darwin" ]]; then
    codesign --remove-signature "dist/${OUTPUT_NAME}"
fi

echo "  Done!"
echo ""

# Step 4: Inject SEA blob
echo "  [4/4] Injecting blob into executable..."
npx -y postject "dist/${OUTPUT_NAME}" NODE_SEA_BLOB dist/typestrike.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# On macOS, re-sign with ad-hoc signature
if [[ "$(uname)" == "Darwin" ]]; then
    codesign --sign - "dist/${OUTPUT_NAME}"
fi

chmod +x "dist/${OUTPUT_NAME}"

echo ""
echo "  ========================================"
echo "   Build complete!"
echo "   Executable: dist/${OUTPUT_NAME}"
echo "  ========================================"
echo ""
echo "  You can now run: ./dist/${OUTPUT_NAME}"
echo ""
