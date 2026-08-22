#!/bin/bash
set -e
cd /Users/silkina/chart-generator

echo "=== Räume Lock-Dateien auf ==="
rm -f .git/HEAD.lock .git/index.lock

echo "=== Checkout main und commit ==="
git checkout main
git add frontend/components/EmailCaptureSection.tsx
git commit -m "feat: Consent-Checkbox + Datenschutzlink im Trigger-Letter-Formular"

echo ""
echo "=== Push zu GitHub ==="
git push origin main

echo ""
echo "=== ✓ Fertig: $(git log --oneline -1) ==="
