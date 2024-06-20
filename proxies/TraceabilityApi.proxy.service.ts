import { TracerStream } from '@/models/TraceabilityStream.model';

class TraceabilityApiProxyService {
  private baseUrl: string = 'http://localhost:5002/';
  private baseUrl2: string = process.env.NEXT_PUBLIC_API_URL || '';

  //#region
  // This is a comment
  // Stream controller
  async createTraceability(traceability: TracerStream): Promise<TracerStream> {
    const response = await fetch(`${this.baseUrl}traceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(traceability),
    });
    return await response.json();
  }

  async getTraceability(name: string): Promise<TracerStream> {
    const nameEncoded = encodeURIComponent(name);
    const response = await fetch(
      `${this.baseUrl}TracerStreams/GetStream/${nameEncoded}`,
    );
    return await response.json();
  }
  //#endregion
}

export const traceabilityApiProxyService = new TraceabilityApiProxyService();
