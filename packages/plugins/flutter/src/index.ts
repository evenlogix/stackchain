/**
 * Official @stackchain/flutter plugin.
 * Provides Flutter-oriented generators for the StackChain ecosystem.
 */
import { definePlugin } from '@stackchain/sdk';

export default definePlugin({
  name: 'flutter',
  version: '0.1.0',
  description: 'Official Flutter generators and architecture layers',
  generators: [],
  commands: [
    {
      name: 'flutter-info',
      command: 'flutter info',
      description: 'Show Flutter plugin capabilities',
    },
  ],
});
