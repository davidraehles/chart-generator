#!/bin/bash
source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR/backend"
python3 -m venv venv 2>/dev/null
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn src.main:app --reload --port 5001
