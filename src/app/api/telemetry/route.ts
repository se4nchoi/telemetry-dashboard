import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Simple in-memory storage for the latest sensor readings received from STM32 hardware
let latestTelemetry = {
  temp: 37.0,
  ph: 7.40,
  oxygen: 95.0,
  pressure: 120.0,
  timestamp: Date.now(),
  packetId: 0,
};

// GET /api/telemetry - Read the latest readings
export async function GET() {
  return NextResponse.json({
    success: true,
    data: latestTelemetry,
  });
}

// POST /api/telemetry - Stream/push new sensor readings (e.g., from STM32 MCU)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate incoming MCU data frame
    const { temp, ph, oxygen, pressure, packetId } = body;

    if (
      typeof temp !== "number" ||
      typeof ph !== "number" ||
      typeof oxygen !== "number" ||
      typeof pressure !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid frame format. Fields must be numbers: temp, ph, oxygen, pressure.",
        },
        { status: 400 }
      );
    }

    const incomingPacketId = typeof packetId === "number" ? packetId : latestTelemetry.packetId + 1;
    
    // Check for sequence gaps and log to file
    const logPath = path.join(process.cwd(), "telemetry_loss.log");
    const timestampStr = new Date().toISOString();
    
    if (incomingPacketId > latestTelemetry.packetId + 1 && latestTelemetry.packetId !== 0) {
      const gap = incomingPacketId - latestTelemetry.packetId - 1;
      const lossLog = `[${timestampStr}] [CRITICAL] Sequence gap detected: expected #${latestTelemetry.packetId + 1}, received #${incomingPacketId} (${gap} frames lost)\n`;
      fs.appendFileSync(logPath, lossLog);
    }

    // Append standard telemetry ledger log
    const receiptLog = `[${timestampStr}] [INFO] Packet #${incomingPacketId} received successfully (Temp: ${temp.toFixed(1)}, pH: ${ph.toFixed(2)}, Oxy: ${oxygen.toFixed(1)}, Pres: ${pressure.toFixed(0)})\n`;
    fs.appendFileSync(logPath, receiptLog);

    // Update in-memory telemetry cache
    latestTelemetry = {
      temp,
      ph,
      oxygen,
      pressure,
      timestamp: Date.now(),
      packetId: incomingPacketId,
    };

    return NextResponse.json({
      success: true,
      message: "Telemetry frame cached and audited successfully",
      packetId: latestTelemetry.packetId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process telemetry payload",
      },
      { status: 500 }
    );
  }
}
