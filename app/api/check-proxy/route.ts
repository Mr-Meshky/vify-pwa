import { NextRequest, NextResponse } from "next/server";
import net from "net";

interface ProxyData {
  server: string;
  port: number;
  secret: string;
}

// Simple TCP connection test to MTProto proxy
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

export async function POST(request: NextRequest) {
  try {
    const body: ProxyData = await request.json();
    const { server, port, secret } = body;

    // Validate inputs
    if (!server || !port || !secret) {
      return NextResponse.json({ ok: false, error: "Invalid parameters" });
    }

    if (port <= 0 || port > 65535) {
      return NextResponse.json({ ok: false, error: "Invalid port" });
    }

    // Test TCP connection with 5 second timeout
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
