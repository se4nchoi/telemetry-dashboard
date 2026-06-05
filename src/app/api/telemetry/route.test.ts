import { expect, test, describe, beforeEach, vi } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import fs from "fs";

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      appendFileSync: vi.fn(),
      promises: {
        appendFile: vi.fn(),
      },
    },
  };
});

describe("Telemetry API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("GET returns initial telemetry data", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("temp");
    expect(data.data).toHaveProperty("ph");
  });

  test("POST validates frame format - rejects invalid fields", async () => {
    const invalidBody = {
      temp: "string-not-number", // invalid
      ph: 7.4,
      oxygen: 95.0,
      pressure: 120.0,
    };

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid frame format");
  });

  test("POST accepts valid telemetry frame and logs to audit ledger", async () => {
    const validBody = {
      temp: 36.8,
      ph: 7.42,
      oxygen: 96.5,
      pressure: 118.0,
      packetId: 1,
    };

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(fs.promises.appendFile).toHaveBeenCalled();
  });
});
