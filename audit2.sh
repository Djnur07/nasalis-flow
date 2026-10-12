#!/bin/bash
echo "=== Collection page source ==="
find . -path ./node_modules -prune -o \( -ipath "*collection*page.tsx" -o -ipath "*collection*page.ts" \) -print -exec cat {} \;

echo "=== Image/public assets folder ==="
find . -path ./node_modules -prune -o -type d -iname "public" -print
ls -la public 2>/dev/null | head -20
find public -iname "*bekantan*" 2>/dev/null | wc -l
find public -iname "*.png" -o -iname "*.jpg" -o -iname "*.webp" 2>/dev/null | wc -l

echo "=== next.config image domains ==="
cat next.config.ts 2>/dev/null
cat next.config.js 2>/dev/null

echo "=== resolveMetadataUri.ts content ==="
cat ./lib/web3/resolveMetadataUri.ts 2>/dev/null

echo "=== useBlockTitansMetadata.ts content ==="
cat ./lib/web3/useBlockTitansMetadata.ts 2>/dev/null

echo "=== any data/json collection list ==="
find . -path ./node_modules -prune -o -iname "*collection*.json" -print
find . -path ./node_modules -prune -o -iname "*tokens*.json" -print
