#!/bin/bash
# Start server
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
timeout 60 bash -c 'until curl -s http://localhost:3000 > /dev/null; do sleep 1; done'
echo "Server started."

# Run test
npx playwright test tests/e2e/live-cms-update.spec.ts
TEST_EXIT_CODE=$?

# Kill server
kill $SERVER_PID
exit $TEST_EXIT_CODE
