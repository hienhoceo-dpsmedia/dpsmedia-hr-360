#!/bin/sh

# Replace placeholders in JS/HTML files with actual environment variables
# We look for the strings we put in index.html

echo "Injecting runtime environment variables..."

# Find all files in the web root and replace placeholders
# We only target index.html for simplicity as that's where our ENV object is
sed -i "s|__VITE_SUPABASE_URL__|$VITE_SUPABASE_URL|g" /usr/share/nginx/html/index.html
sed -i "s|__VITE_SUPABASE_ANON_KEY__|$VITE_SUPABASE_ANON_KEY|g" /usr/share/nginx/html/index.html

echo "Injection complete. Starting Nginx..."

exec "$@"
