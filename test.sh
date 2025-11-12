#!/bin/bash

# MyDataVault Test Script

echo "🚀 MyDataVault Test Script"
echo "=========================="

# Check if required files exist
echo "📁 Checking project structure..."

required_files=(
    "package.json"
    "src/App.tsx"
    "api/server.ts"
    "contracts/src/data_registry.rs"
    "shared/types/index.ts"
    ".env"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm is installed"
else
    echo "❌ pnpm is not installed"
    exit 1
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run: pnpm install"
    exit 1
fi

# Test TypeScript compilation
echo ""
echo "🔧 Testing TypeScript compilation..."
if pnpm run check; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Test backend server startup
echo ""
echo "🖥️  Testing backend server..."
timeout 10s pnpm run server:dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Backend server started successfully"
    kill $SERVER_PID
else
    echo "❌ Backend server failed to start"
fi

# Test frontend build
echo ""
echo "🏗️  Testing frontend build..."
if pnpm run build; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "Next steps:"
echo "1. Start the development server: pnpm run dev"
echo "2. Visit http://localhost:5173"
echo "3. Connect your Polkadot wallet"
echo "4. Start uploading your data!"
echo ""
echo "For more information, see README.md"