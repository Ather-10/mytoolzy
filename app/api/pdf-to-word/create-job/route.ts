import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;

  const response = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "upload-file": { operation: "import/upload" },
        "convert-file": {
          operation: "convert",
          input: "upload-file",
          output_format: "docx",
        },
        "export-file": {
          operation: "export/url",
          input: "convert-file",
        },
      },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}