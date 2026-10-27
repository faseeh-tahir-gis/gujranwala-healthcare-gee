#!/usr/bin/env bash
# Run from inside this folder after creating an EMPTY repo on GitHub.
# Replace REPO_NAME with the repository name you created.
set -e
git init -b main
git add .
git commit -m "Initial commit: Gujranwala healthcare facilities GEE analysis v4.0"
git remote add origin https://github.com/faseeh-tahir-gis/REPO_NAME.git
git push -u origin main
