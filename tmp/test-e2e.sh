#!/bin/bash
echo "=== Multiple E2E Performance Tests ==="
for i in 1 2 3 4 5; do
  echo "Test $i:"
  START=$(date +%s%3N)
  RESULT=$(curl -s -X POST http://localhost:3000/api/hd-chart -H "Content-Type: application/json" -d "{\"firstName\":\"Test$i\",\"birthDate\":\"23.11.1992\",\"birthTime\":\"14:30\",\"birthPlace\":\"Berlin, Germany\"}")
  END=$(date +%s%3N)
  TIME=$((END - START))
  TYPE=$(echo "$RESULT" | jq -r '.type.label' 2>/dev/null)
  echo "  Response time: ${TIME}ms, Type: $TYPE"
  sleep 1
done
