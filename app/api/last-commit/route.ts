import { NextResponse } from "next/server";

const GITHUB_API_URL =
  "https://api.github.com/repos/Mr-Meshky/vify/commits?per_page=1";

export async function GET() {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Vify-PWA",
      },
      next: { revalidate: 900 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data[0]?.commit?.committer?.date) {
      return NextResponse.json(
        { error: "No commit data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      date: data[0].commit.committer.date,
      message: data[0].commit.message,
    });
  } catch (error) {
    console.error("Error fetching commit:", error);
    return NextResponse.json(
      { error: "Failed to fetch commit data" },
      { status: 500 }
    );
  }
}
