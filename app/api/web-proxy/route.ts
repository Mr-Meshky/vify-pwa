import { NextRequest, NextResponse } from "next/server";

// List of web proxy services
const PROXY_SERVICES = [
  {
    name: "CroxyProxy",
    baseUrl: "https://www.croxyproxy.com/proxy",
    formatUrl: (url: string) =>
      `https://www.croxyproxy.com/proxy?url=${encodeURIComponent(url)}`,
  },
  {
    name: "ProxySite",
    baseUrl: "https://www.proxysite.com/go.php",
    formatUrl: (url: string) =>
      `https://www.proxysite.com/go.php?d=${encodeURIComponent(url)}`,
  },
  {
    name: "Hide.me",
    baseUrl: "https://hide.me/en/proxy",
    formatUrl: (url: string) =>
      `https://hide.me/en/proxy?url=${encodeURIComponent(url)}`,
  },
  {
    name: "4everproxy",
    baseUrl: "https://www.4everproxy.com/direct",
    formatUrl: (url: string) =>
      `https://www.4everproxy.com/direct?u=${encodeURIComponent(url)}`,
  },
  {
    name: "FilterBypass",
    baseUrl: "https://www.filterbypass.me/index.php",
    formatUrl: (url: string) =>
      `https://www.filterbypass.me/index.php?q=${Buffer.from(url).toString(
        "base64"
      )}`,
  },
];

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "آدرس وارد شده معتبر نیست" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
      if (!["http:", "https:"].includes(validatedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "آدرس وارد شده معتبر نیست" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for localhost/private IPs (security)
    const hostname = validatedUrl.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.endsWith(".local")
    ) {
      return NextResponse.json(
        { error: "دسترسی به آدرس‌های محلی امکان‌پذیر نیست" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Select primary proxy service (CroxyProxy is most reliable)
    const primaryProxy = PROXY_SERVICES[0];
    const proxyUrl = primaryProxy.formatUrl(validatedUrl.toString());

    // Generate alternative proxy URLs
    const alternativeUrls = PROXY_SERVICES.slice(1).map((service) => ({
      name: service.name,
      url: service.formatUrl(validatedUrl.toString()),
    }));

    return NextResponse.json(
      {
        success: true,
        originalUrl: validatedUrl.toString(),
        proxyUrl,
        proxyService: primaryProxy.name,
        alternatives: alternativeUrls,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Web proxy error:", error);
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "پارامتر url الزامی است" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Redirect to POST handler logic
  const postRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ url }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  return POST(postRequest);
}
