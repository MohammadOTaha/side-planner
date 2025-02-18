#!/bin/sh

# Exit on error
set -e

echo "⏳ Waiting for the database to be ready..."
# We use the same pg_isready command as in the healthcheck
until pg_isready -h db -U ${POSTGRES_USER}; do
    echo "Database is not ready - sleeping"
    sleep 2
done

echo "🏃 Running database migrations..."
npm run db:migrate

echo "🚀 Starting the application..."
exec "$@" 