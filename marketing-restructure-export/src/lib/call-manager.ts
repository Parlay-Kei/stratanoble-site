// Simple in-memory call manager for testing/logging during development.
// In production, consider persisting to a store.

type CallInfo = {
  testName: string;
  streamSid?: string;
  startedAt?: number;
  lastEventAt?: number;
};

class CallManager {
  private calls = new Map<string, CallInfo>();

  upsert(testName: string, info: Partial<CallInfo>) {
    const existing = this.calls.get(testName) || { testName };
    const merged = {
      ...existing,
      ...info,
      lastEventAt: Date.now(),
    } as CallInfo;
    this.calls.set(testName, merged);
  }

  setStreamSid(testName: string, streamSid: string) {
    this.upsert(testName, { streamSid });
  }

  get(testName: string) {
    return this.calls.get(testName);
  }

  remove(testName: string) {
    this.calls.delete(testName);
  }

  list() {
    return Array.from(this.calls.values());
  }
}

export const callManager = new CallManager();