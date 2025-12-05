#!/bin/bash
echo "=== Backend Direct Performance Test ==="
TIMES=()
for i in 1 2 3 4 5; do
  START=$(date +%s%N)
  curl -s -X POST http://localhost:5000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin, Germany"}' \
    > /dev/null
  END=$(date +%s%N)
  TIME=$(( (END - START) / 1000000 ))
  TIMES+=($TIME)
  echo "Test $i: ${TIME}ms"
  sleep 0.5
done

echo ""
echo "=== Frontend Proxy Performance Test ==="
for i in 1 2 3 4 5; do
  START=$(date +%s%N)
  curl -s -X POST http://localhost:3000/api/hd-chart \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","birthDate":"23.11.1992","birthTime":"14:30","birthPlace":"Berlin, Germany"}' \
    > /dev/null
  END=$(date +%s%N)
  TIME=$(( (END - START) / 1000000 ))
  echo "Test $i: ${TIME}ms"
  sleep 0.5
done
