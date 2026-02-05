#!/bin/sh
set -e

echo "Starting database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
exec node dist/main
