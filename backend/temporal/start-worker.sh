#!/bin/bash

# Start Temporal worker
echo "Starting Temporal worker..."
cd /Users/jyoo/Desktop/job-tracker-mvp/temporal
node worker.js &
WORKER_PID=$!

echo "Temporal worker started with PID: $WORKER_PID"
echo "Worker is running in the background"
echo "To stop the worker, run: kill $WORKER_PID"

# Keep the script running
wait $WORKER_PID
