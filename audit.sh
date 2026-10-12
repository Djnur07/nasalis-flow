#!/bin/bash
echo "=== git status ==="
git status
echo "=== branches ==="
git branch -a
echo "=== last commits ==="
git log --oneline -10
echo "=== dependencies ==="
grep -E 'next|react|wagmi|viem|typescript' package.json
echo "=== artwork files referenced ==="
grep -rl "bekantan-" --include="*.tsx" --include="*.ts" --include="*.json" . | wc -l
echo "=== metadata/csv files ==="
find . -path ./node_modules -prune -o -iname "*metadata*" -print
find . -path ./node_modules -prune -o -iname "*.csv" -print
echo "=== env keys only ==="
cat .env.local 2>/dev/null | cut -d '=' -f1
cat .env.example 2>/dev/null
echo "=== build ==="
npm install
npm run lint
npm run build
