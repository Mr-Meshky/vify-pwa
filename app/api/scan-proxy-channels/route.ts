import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const REQUIRED_CLIENT_HEADER = "x-vify-client";
const REQUIRED_CLIENT_VALUE = "web";

function decodeHtmlEntities(str: string): string {
  return decodeURIComponent(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

async function fetchChannelProxies(
  channel: string,
  messageCount: number = 20
): Promise<{ proxies: string[]; errors: string[] }> {
  const url = `https://t.me/s/${channel}`;
  const result: { proxies: string[]; errors: string[] } = {
    proxies: [],
    errors: [],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      result.errors.push(channel);
      return result;
    }

    const html = await response.text();

    // Match MTProto proxy links (tg:// or https://t.me/proxy)
    const proxyRegex =
      /(tg:\/\/proxy\?[^\s<>"]+|https?:\/\/t\.me\/proxy\?[^\s<>"]+)/gi;
    const matches = html.match(proxyRegex);

    if (!matches) {
      result.errors.push(channel);
      return result;
    }

    // Get last N messages worth of proxies
    const lastProxies = matches.slice(-messageCount);

    for (const element of lastProxies) {
      const decoded = decodeHtmlEntities(element);
      // Validate it's a proper proxy link
      if (decoded.includes("server=") && decoded.includes("port=") && decoded.includes("secret=")) {
        result.proxies.push(decoded);
      }
    }

    return result;
  } catch {
    result.errors.push(channel);
    return result;
  }
}

function withCORS(res: NextResponse, origin: string | null) {
  if (origin === ALLOWED_ORIGIN) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, x-vify-client"
    );
  }
  return res;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin !== ALLOWED_ORIGIN) {
    return new NextResponse(null, { status: 403 });
  }

  return withCORS(new NextResponse(null, { status: 204 }), origin);
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const client = request.headers.get(REQUIRED_CLIENT_HEADER);

    // Origin check
    if (origin !== ALLOWED_ORIGIN) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    // Client header check
    if (client !== REQUIRED_CLIENT_VALUE) {
      return NextResponse.json(
        { error: "Unauthorized client" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const channels: string[] = body.channels;
    const messageCount: number = Math.min(
      100,
      Math.max(1, body.messageCount || 20)
    );

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return withCORS(
        NextResponse.json(
          { error: "channels array is required" },
          { status: 400 }
        ),
        origin
      );
    }

    if (channels.length > 20) {
      return withCORS(
        NextResponse.json(
          { error: "Maximum 20 channels allowed per request" },
          { status: 400 }
        ),
        origin
      );
    }

    const allProxies: string[] = [];
    const allErrors: string[] = [];

    for (const channel of channels) {
      const result = await fetchChannelProxies(channel.trim(), messageCount);
      allProxies.push(...result.proxies);
      allErrors.push(...result.errors);
      // Small delay between channels
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Deduplicate proxies
    const uniqueProxies = [...new Set(allProxies)];

    return withCORS(
      NextResponse.json({
        success: true,
        proxies: uniqueProxies,
        stats: {
          total: uniqueProxies.length,
          channels: channels.length,
          errors: allErrors.length,
        },
        errors: allErrors,
      }),
      origin
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
