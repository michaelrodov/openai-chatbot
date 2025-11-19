#!/bin/bash

# Script to set Railway environment variables from .env_prod file
# Usage: ./set-railway-env.sh

ENV_FILE=".env_prod"

# Check if .env_prod exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found!"
    exit 1
fi

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Error: railway CLI is not installed!"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

echo "Reading variables from $ENV_FILE..."

# Build the railway variables command
RAILWAY_CMD="railway variables"

# Read the file line by line
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines
    if [ -z "$line" ]; then
        continue
    fi

    # Skip lines starting with # (comments)
    if [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Check if line contains an equals sign (is a variable assignment)
    if [[ "$line" =~ = ]]; then
        # Extract key and value
        KEY=$(echo "$line" | cut -d '=' -f 1 | xargs)
        VALUE=$(echo "$line" | cut -d '=' -f 2- | xargs)

        # Skip if key or value is empty
        if [ -n "$KEY" ] && [ -n "$VALUE" ]; then
            echo "Adding: $KEY"
            RAILWAY_CMD="$RAILWAY_CMD --set \"$KEY=$VALUE\""
        fi
    fi
done < "$ENV_FILE"

echo ""
echo "Executing Railway command..."
echo ""

# Execute the command
eval $RAILWAY_CMD

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Successfully set all environment variables in Railway!"
else
    echo ""
    echo "✗ Failed to set environment variables. Check your Railway authentication."
    exit 1
fi
