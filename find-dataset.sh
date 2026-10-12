#!/bin/bash
echo "=== Folder kandidat (nama mengandung output/images/nasalis/metadata) ==="
find ~ -maxdepth 6 -type d \( -iname "*output*" -o -iname "*nasalis*" -o -iname "*metadata*" \) 2>/dev/null | grep -v "/Library/" | grep -v "node_modules"

echo ""
echo "=== Cek jumlah file .png di tiap folder kandidat tadi (manual lanjutan) ==="
echo "Jalankan: find \"PATH_FOLDER\" -iname '*.png' | wc -l   untuk tiap folder yang muncul di atas"

echo ""
echo "=== Cek file CSV besar di seluruh home folder ==="
find ~ -maxdepth 6 -iname "*.csv" 2>/dev/null | grep -v "node_modules"
