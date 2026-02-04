import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let browser;

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL missing");

    browser = await puppeteer.launch({
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    await page.goto("https://proxypal.net/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const inputXPath =
      "/html/body/div[2]/div/div/div/div[2]/div/div[2]/form/div/input";

    const input = await page.waitForSelector(`xpath/${inputXPath}`, {
      timeout: 15000,
    });

    if (!input) {
      throw new Error("input not found");
    }

    const startUrl = page.url();

    await input.click({ clickCount: 3 });
    await input.type(url, { delay: 20 });
    await page.keyboard.press("Enter");

    await page.waitForFunction(
      (oldUrl) => window.location.href !== oldUrl,
      { timeout: 30000 },
      startUrl,
    );

    const finalUrl = page.url();

    await browser.close();

    return NextResponse.json({
      success: true,
      proxyUrl: finalUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 },
    );
  }
}
