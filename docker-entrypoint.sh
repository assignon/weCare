#!/bin/sh

# Docker entrypoint script for Shopper App
# Handles environment variable injection and service startup

set -e

echo "🛍️ Starting afriQExpress Shopper App..."

# Define the path to the built app
APP_DIR="/usr/share/nginx/html"

# Function to inject environment variables into the built JavaScript files
inject_env_vars() {
    echo "📝 Injecting environment variables..."
    
    # Find all JavaScript files in the build directory
    find "$APP_DIR" -name "*.js" -type f | while read -r file; do
        echo "Processing $file..."
        
        # Replace environment variable placeholders with actual values
        sed -i "s|VITE_FIREBASE_API_KEY_PLACEHOLDER|${VITE_FIREBASE_API_KEY:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER|${VITE_FIREBASE_AUTH_DOMAIN:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_PROJECT_ID_PLACEHOLDER|${VITE_FIREBASE_PROJECT_ID:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER|${VITE_FIREBASE_STORAGE_BUCKET:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_SENDER_ID_PLACEHOLDER|${VITE_FIREBASE_SENDER_ID:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_APP_ID_PLACEHOLDER|${VITE_FIREBASE_APP_ID:-}|g" "$file"
        sed -i "s|VITE_FIREBASE_VAPID_KEY_PLACEHOLDER|${VITE_FIREBASE_VAPID_KEY:-}|g" "$file"
        sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL:-/api}|g" "$file"
    done
    
    # Also update the Firebase service worker if it exists
    if [ -f "$APP_DIR/firebase-messaging-sw.js" ]; then
        echo "Processing Firebase service worker..."
        sed -i "s|{{VITE_FIREBASE_API_KEY}}|${VITE_FIREBASE_API_KEY:-}|g" "$APP_DIR/firebase-messaging-sw.js"
        sed -i "s|{{VITE_FIREBASE_AUTH_DOMAIN}}|${VITE_FIREBASE_AUTH_DOMAIN:-}|g" "$APP_DIR/firebase-messaging-sw.js"
        sed -i "s|{{VITE_FIREBASE_PROJECT_ID}}|${VITE_FIREBASE_PROJECT_ID:-}|g" "$APP_DIR/firebase-messaging-sw.js"
        sed -i "s|{{VITE_FIREBASE_STORAGE_BUCKET}}|${VITE_FIREBASE_STORAGE_BUCKET:-}|g" "$APP_DIR/firebase-messaging-sw.js"
        sed -i "s|{{VITE_FIREBASE_SENDER_ID}}|${VITE_FIREBASE_SENDER_ID:-}|g" "$APP_DIR/firebase-messaging-sw.js"
        sed -i "s|{{VITE_FIREBASE_APP_ID}}|${VITE_FIREBASE_APP_ID:-}|g" "$APP_DIR/firebase-messaging-sw.js"
    fi
    
    echo "✅ Environment variables injected successfully"
}

# Function to validate required environment variables
validate_env() {
    echo "🔍 Validating environment variables..."
    
    # Firebase variables (optional but recommended)
    FIREBASE_VARS="VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN VITE_FIREBASE_PROJECT_ID VITE_FIREBASE_STORAGE_BUCKET VITE_FIREBASE_SENDER_ID VITE_FIREBASE_APP_ID"
    
    # Check Firebase variables
    missing_firebase=0
    for var in $FIREBASE_VARS; do
        eval "value=\$$var"
        if [ -z "$value" ]; then
            missing_firebase=$((missing_firebase + 1))
        fi
    done
    
    if [ $missing_firebase -gt 0 ]; then
        echo "⚠️  WARNING: $missing_firebase Firebase environment variables are missing or empty."
        echo "   Push notifications may not work properly."
        echo "   Please set the following variables: $FIREBASE_VARS"
    else
        echo "✅ All Firebase environment variables are set"
    fi
    
    # Set default API URL if not provided
    if [ -z "$VITE_API_URL" ]; then
        echo "📝 Setting default API URL to /api"
        export VITE_API_URL="/api"
    fi
    
    echo "✅ Environment validation completed"
}

# Function to display startup information
show_startup_info() {
    echo ""
    echo "🛍️ afriQExpress Shopper App"
    echo "📍 Server: http://localhost:8081"
    echo "🔧 API URL: ${VITE_API_URL:-/api}"
    echo "🔥 Firebase Project: ${VITE_FIREBASE_PROJECT_ID:-Not configured}"
    echo ""
}

# Main execution
main() {
    validate_env
    inject_env_vars
    show_startup_info
    
    echo "🚀 Starting nginx..."
    
    # Start nginx in foreground
    exec nginx -g 'daemon off;'
}

# Execute main function
main "$@" 