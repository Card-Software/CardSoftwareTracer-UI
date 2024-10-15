import { TracerStreamExtended } from './tracer-stream';

// models/tier.ts
export interface Tier {
  id: string;
  name: string;
  description: string;
  tracerStream?: TracerStreamExtended | null; // Optional tracer stream associated with the tier
  connectedTierId?: string | null; // Reference to another tier if connected
}
