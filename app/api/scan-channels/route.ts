import { NextRequest, NextResponse } from "next/server";

// Types
type Result = Record<"config" | "country" | "typeConfig", string>;
type FinalResult = Record<"protocol", string> & Result;

interface IPApiResponse {
  country: string;
  query: string;
  countryCode: string;
}

interface CategoryResult {
  protocol: Record<string, string[]>;
  country: Record<string, string[]>;
  type: Record<string, string[]>;
  all: string[];
  errors: string[];
}

// Constants
const countGetConfigOfEveryChannel = 2;
const countryFlagMap: Record<string, string> = {
  AF: "AF", AL: "AL", DZ: "DZ", AD: "AD", AO: "AO", AG: "AG", AR: "AR", AM: "AM",
  AU: "AU", AT: "AT", AZ: "AZ", BS: "BS", BH: "BH", BD: "BD", BB: "BB", BY: "BY",
  BE: "BE", BZ: "BZ", BJ: "BJ", BT: "BT", BO: "BO", BA: "BA", BW: "BW", BR: "BR",
  BN: "BN", BG: "BG", BF: "BF", BI: "BI", CV: "CV", KH: "KH", CM: "CM", CA: "CA",
  CF: "CF", TD: "TD", CL: "CL", CN: "CN", CO: "CO", KM: "KM", CG: "CG", CR: "CR",
  HR: "HR", CU: "CU", CY: "CY", CZ: "CZ", CD: "CD", DK: "DK", DJ: "DJ", DM: "DM",
  DO: "DO", EC: "EC", EG: "EG", SV: "SV", GQ: "GQ", ER: "ER", EE: "EE", SZ: "SZ",
  ET: "ET", FJ: "FJ", FI: "FI", FR: "FR", GA: "GA", GM: "GM", GE: "GE", DE: "DE",
  GH: "GH", GR: "GR", GD: "GD", GT: "GT", GN: "GN", GW: "GW", GY: "GY", HT: "HT",
  HN: "HN", HU: "HU", IS: "IS", IN: "IN", ID: "ID", IR: "IR", IQ: "IQ", IE: "IE",
  IL: "IL", IT: "IT", JM: "JM", JP: "JP", JO: "JO", KZ: "KZ", KE: "KE", KI: "KI",
  KW: "KW", KG: "KG", LA: "LA", LV: "LV", LB: "LB", LS: "LS", LR: "LR", LY: "LY",
  LI: "LI", LT: "LT", LU: "LU", MG: "MG", MW: "MW", MY: "MY", MV: "MV", ML: "ML",
  MT: "MT", MH: "MH", MR: "MR", MU: "MU", MX: "MX", FM: "FM", MD: "MD", MC: "MC",
  MN: "MN", ME: "ME", MA: "MA", MZ: "MZ", MM: "MM", NA: "NA", NR: "NR", NP: "NP",
  NL: "NL", NZ: "NZ", NI: "NI", NE: "NE", NG: "NG", KP: "KP", MK: "MK", NO: "NO",
  OM: "OM", PK: "PK", PW: "PW", PS: "PS", PA: "PA", PG: "PG", PY: "PY", PE: "PE",
  PH: "PH", PL: "PL", PT: "PT", QA: "QA", RO: "RO", RU: "RU", RW: "RW", KN: "KN",
  LC: "LC", VC: "VC", WS: "WS", SM: "SM", ST: "ST", SA: "SA", SN: "SN", RS: "RS",
  SC: "SC", SL: "SL", SG: "SG", SK: "SK", SI: "SI", SB: "SB", SO: "SO", ZA: "ZA",
  KR: "KR", SS: "SS", ES: "ES", LK: "LK", SD: "SD", SR: "SR", SE: "SE", CH: "CH",
  SY: "SY", TW: "TW", TJ: "TJ", TZ: "TZ", TH: "TH", TL: "TL", TG: "TG", TO: "TO",
  TT: "TT", TN: "TN", TR: "TR", TM: "TM", TV: "TV", UG: "UG", UA: "UA", AE: "AE",
  GB: "GB", US: "US", UY: "UY", UZ: "UZ", VU: "VU", VA: "VA", VE: "VE", VN: "VN",
  YE: "YE", ZM: "ZM", ZW: "ZW", UN: "UN"
};

// Helper functions
function decodeHtmlEntities(str: string): string {
  return decodeURIComponent(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function encodeBase64Unicode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const uint8array = new TextEncoder().encode(json);
  return btoa(String.fromCharCode(...uint8array));
}

function decodeBase64Unicode(str: string): Record<string, unknown> {
  const binaryString = atob(str);
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

async function checkIP(ipaddress: string): Promise<{
  country: string;
  flag: string;
  ip: string;
  countryCode: string;
}> {
  let data: Partial<IPApiResponse> = {};

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://www.irjh.top/py/check/ip.php?ip=${ipaddress}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      data = (await response.json()) as IPApiResponse;
    }
  } catch {
    // Ignore errors, use defaults
  }

  const country = data.country ?? "Unknown";
  const countryCode = data.countryCode ?? "UN";
  const flag = countryFlagMap[countryCode] ?? "UN";
  const ip = data.query ?? ipaddress;

  return { country, flag, ip, countryCode };
}

async function vmessHandle(input: string): Promise<Result> {
  const configinfo = decodeBase64Unicode(input) as Record<string, string>;

  const { countryCode, country, ip } = await checkIP(configinfo.add);
  configinfo.ps = `${countryCode} | ${ip}`;

  return {
    config: encodeBase64Unicode(configinfo),
    country: country,
    typeConfig: configinfo.net,
  };
}

async function configChanger(urlString: string): Promise<FinalResult | null> {
  try {
    const protocol = urlString.split("://")[0];
    let config: string, country: string, typeConfig: string;

    if (protocol === "vmess") {
      const vmessConf = await vmessHandle(urlString.split("://")[1]);
      config = "vmess://" + vmessConf.config;
      country = vmessConf.country;
      typeConfig = vmessConf.typeConfig;
    } else {
      const { hostname, searchParams } = new URL(urlString);
      const api = await checkIP(hostname);

      typeConfig = searchParams.get("type") ?? "";
      country = api.country;
      config = urlString.split("#")[0] + "#" + `${api.countryCode} | ${api.ip}`;
    }

    return { protocol, config, country, typeConfig };
  } catch {
    return null;
  }
}

async function fetchChannelConfigs(
  channel: string,
  result: CategoryResult
): Promise<void> {
  const url = `https://t.me/s/${channel}`;

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
      return;
    }

    const html = await response.text();
    const regex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(regex);

    if (!matches) {
      result.errors.push(channel);
      return;
    }

    const lastConfigs = matches.slice(-countGetConfigOfEveryChannel);

    for (const element of lastConfigs) {
      const decodeHtml = decodeHtmlEntities(element);

      if (decodeHtml.includes("…")) {
        continue;
      }

      const finalResult = await configChanger(decodeHtml);

      if (finalResult) {
        // Add to protocol category
        if (!result.protocol[finalResult.protocol]) {
          result.protocol[finalResult.protocol] = [];
        }
        result.protocol[finalResult.protocol].push(finalResult.config);

        // Add to country category
        if (!result.country[finalResult.country]) {
          result.country[finalResult.country] = [];
        }
        result.country[finalResult.country].push(finalResult.config);

        // Add to type category
        if (finalResult.typeConfig) {
          if (!result.type[finalResult.typeConfig]) {
            result.type[finalResult.typeConfig] = [];
          }
          result.type[finalResult.typeConfig].push(finalResult.config);
        }

        // Add to all
        result.all.push(finalResult.config);
      }
    }
  } catch {
    result.errors.push(channel);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const channels: string[] = body.channels;

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json(
        { error: "channels array is required" },
        { status: 400 }
      );
    }

    if (channels.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 channels allowed per request" },
        { status: 400 }
      );
    }

    const result: CategoryResult = {
      protocol: {},
      country: {},
      type: {},
      all: [],
      errors: [],
    };

    // Process channels sequentially to avoid rate limiting
    for (const channel of channels) {
      await fetchChannelConfigs(channel.trim(), result);
      // Small delay between channels to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      data: result,
      stats: {
        totalConfigs: result.all.length,
        protocols: Object.keys(result.protocol).length,
        countries: Object.keys(result.country).length,
        types: Object.keys(result.type).length,
        errors: result.errors.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
