import { vi } from 'vitest';

// Mock self.location
globalThis.self = {
    location: {
        href: 'http://localhost:3000/app',
        assign: vi.fn(),
    },
} as any;

// Setup fetch mock
globalThis.fetch = vi.fn();
