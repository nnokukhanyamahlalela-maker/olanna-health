#!/bin/bash
set -e

echo "==> Installing dependencies..."
npm install --legacy-peer-deps

echo "==> Pushing database schema..."
npm run db:push

echo "==> Post-merge setup complete."
