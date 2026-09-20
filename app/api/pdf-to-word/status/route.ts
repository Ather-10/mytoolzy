import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  const jobId = req.nextUrl.searchParams.get("jobId");

  const response = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();
  return NextResponse.json(data);
}