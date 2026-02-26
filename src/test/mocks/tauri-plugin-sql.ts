import { vi } from "vitest";

export interface MockDatabase {
  select: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

export function createMockDatabase(): MockDatabase {
  return {
    select: vi.fn().mockResolvedValue([]),
    execute: vi.fn().mockResolvedValue({ rowsAffected: 0, lastInsertId: 0 }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

const mockDb = createMockDatabase();

const MockDefault = {
  load: vi.fn().mockResolvedValue(mockDb),
};

export { mockDb };
export default MockDefault;
