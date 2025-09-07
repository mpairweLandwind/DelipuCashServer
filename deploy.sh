#!/bin/bash

# Vercel Deployment Script for DelipuCash Backend

echo "🚀 Starting Vercel deployment for DelipuCash Backend..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
yarn prisma generate

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel deploy --prod

echo "✅ Deployment completed!"
echo "📋 Don't forget to:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Configure your database connection"
echo "   3. Update CORS origins if needed"
