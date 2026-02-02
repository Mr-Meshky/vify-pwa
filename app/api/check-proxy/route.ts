import { NextRequest, NextResponse } from "next/server";
import net from "net";

interface ProxyData {
  server: string;
  port: number;
  secret: string;
  multiTest?: boolean;
}

// TCP connection test to MTProto proxy
async function testProxyConnection(
  server: string,
  port: number,
  timeout: number = 5000
): Promise<{ ok: boolean; ping: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on("connect", () => {
      const ping = Date.now() - startTime;
      socket.destroy();
      resolve({ ok: true, ping });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ok: false, ping: 0 });
    });

    socket.on("error", () => {
      socket.destroy();
      resolve({ ok: false, ping: 0 });
    });

    socket.connect(port, server);
  });
}

// Multi-test for more accurate results
async function multiTestProxy(
  server: string,
  port: number,
  testCount: number = 3
): Promise<{ ok: boolean; ping?: number; avgPing?: number; jitter?: number; testCount?: number }> {
  const pings: number[] = [];
  let successCount = 0;

  for (let i = 0; i < testCount; i++) {
    const result = await testProxyConnection(server, port, 6000);
    if (result.ok) {
      successCount++;
      pings.push(result.ping);
    }
    // Small delay between tests
    if (i < testCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Need at least 2 successful tests
  if (successCount < 2) {
    return { ok: false };
  }

  // Calculate statistics
  const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
  const minPing = Math.min(...pings);
  
  // Calculate jitter (variation in ping)
  let jitter = 0;
  if (pings.length > 1) {
    const diffs = pings.slice(1).map((p, i) => Math.abs(p - pings[i]));
    jitter = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }

  return {
    ok: true,
    ping: minPing,
    avgPing,
    jitter,
    testCount: successCount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProxyData = await request.json();
    const { server, port, secret, multiTest } = body;

    // Validate inputs
    if (!server || !port || !secret) {
      return NextResponse.json({ ok: false, error: "Invalid parameters" });
    }

    if (port <= 0 || port > 65535) {
      return NextResponse.json({ ok: false, error: "Invalid port" });
    }

    // Multi-test mode for more accurate results
    if (multiTest) {
      const result = await multiTestProxy(server, port, 3);
      return NextResponse.json(result);
    }

    // Single test (legacy mode)
    const result = await testProxyConnection(server, port, 5000);

    if (result.ok) {
      return NextResponse.json({ ok: true, ping: result.ping });
    } else {
      return NextResponse.json({ ok: false });
    }
  } catch (error) {
    console.error("Proxy check error:", error);
    return NextResponse.json({ ok: false, error: "Check failed" });
  }
}
