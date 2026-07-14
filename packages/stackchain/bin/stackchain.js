#!/usr/bin/env node
import { run } from '@evenlogix/stackchain-cli';

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
