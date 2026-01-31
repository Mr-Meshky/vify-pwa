import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

const DEFAULT_MESSAGE_COUNT = 5;
const countryFlagMap: Record<string, string> = {
  AF: "AF",
  AL: "AL",
  DZ: "DZ",
  AD: "AD",
  AO: "AO",
  AG: "AG",
  AR: "AR",
  AM: "AM",
  AU: "AU",
  AT: "AT",
  AZ: "AZ",
  BS: "BS",
  BH: "BH",
  BD: "BD",
  BB: "BB",
  BY: "BY",
  BE: "BE",
  BZ: "BZ",
  BJ: "BJ",
  BT: "BT",
  BO: "BO",
  BA: "BA",
  BW: "BW",
  BR: "BR",
  BN: "BN",
  BG: "BG",
  BF: "BF",
  BI: "BI",
  CV: "CV",
  KH: "KH",
  CM: "CM",
  CA: "CA",
  CF: "CF",
  TD: "TD",
  CL: "CL",
  CN: "CN",
  CO: "CO",
  KM: "KM",
  CG: "CG",
  CR: "CR",
  HR: "HR",
  CU: "CU",
  CY: "CY",
  CZ: "CZ",
  CD: "CD",
  DK: "DK",
  DJ: "DJ",
  DM: "DM",
  DO: "DO",
  EC: "EC",
  EG: "EG",
  SV: "SV",
  GQ: "GQ",
  ER: "ER",
  EE: "EE",
  SZ: "SZ",
  ET: "ET",
  FJ: "FJ",
  FI: "FI",
  FR: "FR",
  GA: "GA",
  GM: "GM",
  GE: "GE",
  DE: "DE",
  GH: "GH",
  GR: "GR",
  GD: "GD",
  GT: "GT",
  GN: "GN",
  GW: "GW",
  GY: "GY",
  HT: "HT",
  HN: "HN",
  HU: "HU",
  IS: "IS",
  IN: "IN",
  ID: "ID",
  IR: "IR",
  IQ: "IQ",
  IE: "IE",
  IL: "IL",
  IT: "IT",
  JM: "JM",
  JP: "JP",
  JO: "JO",
  KZ: "KZ",
  KE: "KE",
  KI: "KI",
  KW: "KW",
  KG: "KG",
  LA: "LA",
  LV: "LV",
  LB: "LB",
  LS: "LS",
  LR: "LR",
  LY: "LY",
  LI: "LI",
  LT: "LT",
  LU: "LU",
  MG: "MG",
  MW: "MW",
  MY: "MY",
  MV: "MV",
  ML: "ML",
  MT: "MT",
  MH: "MH",
  MR: "MR",
  MU: "MU",
  MX: "MX",
  FM: "FM",
  MD: "MD",
  MC: "MC",
  MN: "MN",
  ME: "ME",
  MA: "MA",
  MZ: "MZ",
  MM: "MM",
  NA: "NA",
  NR: "NR",
  NP: "NP",
  NL: "NL",
  NZ: "NZ",
  NI: "NI",
  NE: "NE",
  NG: "NG",
  KP: "KP",
  MK: "MK",
  NO: "NO",
  OM: "OM",
  PK: "PK",
  PW: "PW",
  PS: "PS",
  PA: "PA",
  PG: "PG",
  PY: "PY",
  PE: "PE",
  PH: "PH",
  PL: "PL",
  PT: "PT",
  QA: "QA",
  RO: "RO",
  RU: "RU",
  RW: "RW",
  KN: "KN",
  LC: "LC",
  VC: "VC",
  WS: "WS",
  SM: "SM",
  ST: "ST",
  SA: "SA",
  SN: "SN",
  RS: "RS",
  SC: "SC",
  SL: "SL",
  SG: "SG",
  SK: "SK",
  SI: "SI",
  SB: "SB",
  SO: "SO",
  ZA: "ZA",
  KR: "KR",
  SS: "SS",
  ES: "ES",
  LK: "LK",
  SD: "SD",
  SR: "SR",
  SE: "SE",
  CH: "CH",
  SY: "SY",
  TW: "TW",
  TJ: "TJ",
  TZ: "TZ",
  TH: "TH",
  TL: "TL",
  TG: "TG",
  TO: "TO",
  TT: "TT",
  TN: "TN",
  TR: "TR",
  TM: "TM",
  TV: "TV",
  UG: "UG",
  UA: "UA",
  AE: "AE",
  GB: "GB",
  US: "US",
  UY: "UY",
  UZ: "UZ",
  VU: "VU",
  VA: "VA",
  VE: "VE",
  VN: "VN",
  YE: "YE",
  ZM: "ZM",
  ZW: "ZW",
  UN: "UN",
};

function getCountryFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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
  } catch {}

  const country = data.country ?? "Unknown";
  const countryCode = data.countryCode ?? "UN";
  const flag = countryFlagMap[countryCode] ?? "UN";
  const ip = data.query ?? ipaddress;

  return { country, flag, ip, countryCode };
}

async function vmessHandle(input: string, messageId: string): Promise<Result> {
  const configinfo = decodeBase64Unicode(input) as Record<string, string>;

  const { countryCode, country } = await checkIP(configinfo.add);
  const flag = getCountryFlagEmoji(countryCode);
  configinfo.ps = `${flag} @MrMeshkyChannel ${messageId}`;

  return {
    config: encodeBase64Unicode(configinfo),
    country: country,
    typeConfig: configinfo.net,
  };
}

async function configChanger(
  urlString: string,

  messageId: string
): Promise<FinalResult | null> {
  try {
    const protocol = urlString.split("://")[0];
    let config: string, country: string, typeConfig: string;

    if (protocol === "vmess") {
      const vmessConf = await vmessHandle(urlString.split("://")[1], messageId);
      config = "vmess://" + vmessConf.config;
      country = vmessConf.country;
      typeConfig = vmessConf.typeConfig;
    } else {
      const { hostname, searchParams } = new URL(urlString);
      const api = await checkIP(hostname);
      const flag = getCountryFlagEmoji(api.countryCode);

      typeConfig = searchParams.get("type") ?? "";
      country = api.country;
      config =
        urlString.split("#")[0] +
        "#" +
        encodeURIComponent(
          `${flag} @MrMeshkyChannel ${crypto.randomInt(100000, 999999)}`
        );
    }

    return { protocol, config, country, typeConfig };
  } catch {
    return null;
  }
}

async function fetchChannelConfigs(
  channel: string,
  result: CategoryResult,
  messageCount: number = DEFAULT_MESSAGE_COUNT
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
    const messageIdRegex = /data-post="[^/]+\/(\d+)"/g;
    const messageIds: string[] = [];
    let idMatch;
    while ((idMatch = messageIdRegex.exec(html)) !== null) {
      messageIds.push(idMatch[1]);
    }

    const configRegex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(configRegex);

    if (!matches) {
      result.errors.push(channel);
      return;
    }

    const lastConfigs = matches.slice(-messageCount);
    const lastMessageIds = messageIds.slice(
      -Math.max(messageIds.length, lastConfigs.length)
    );

    let configIndex = 0;
    for (const element of lastConfigs) {
      const decodeHtml = decodeHtmlEntities(element);

      if (decodeHtml.includes("…")) {
        configIndex++;
        continue;
      }

      const messageId =
        lastMessageIds[Math.min(configIndex, lastMessageIds.length - 1)] ||
        String(configIndex + 1);

      const finalResult = await configChanger(decodeHtml, messageId);
      configIndex++;

      if (finalResult) {
        if (!result.protocol[finalResult.protocol]) {
          result.protocol[finalResult.protocol] = [];
        }
        result.protocol[finalResult.protocol].push(finalResult.config);

        if (!result.country[finalResult.country]) {
          result.country[finalResult.country] = [];
        }
        result.country[finalResult.country].push(finalResult.config);

        if (finalResult.typeConfig) {
          if (!result.type[finalResult.typeConfig]) {
            result.type[finalResult.typeConfig] = [];
          }
          result.type[finalResult.typeConfig].push(finalResult.config);
        }

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
    const messageCount: number = Math.min(
      50,
      Math.max(1, body.messageCount || DEFAULT_MESSAGE_COUNT)
    );

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

    for (const channel of channels) {
      await fetchChannelConfigs(channel.trim(), result, messageCount);
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
