#!/bin/bash

echo "[" > localidades_array.json
OFFSET=0
MAX=5000
FIRST=true

while true; do
  echo "Descargando desde offset $OFFSET..."
  RESPONSE=$(curl -s -L "https://apis.datos.gob.ar/georef/api/v2.0/localidades?max=$MAX&offset=$OFFSET")

  COUNT=$(echo "$RESPONSE" | jq '.localidades | length')

  if [ "$COUNT" -eq 0 ]; then
    break
  fi

  if [ "$FIRST" = false ]; then
    echo "," >> localidades_array.json
  fi

  echo "$RESPONSE" | jq '.localidades' | sed '1d;$d' >> localidades_array.json

  FIRST=false
  OFFSET=$((OFFSET + MAX))
done

echo "]" >> localidades_array.json
