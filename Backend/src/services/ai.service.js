const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// HELPER — Call Groq and parse JSON response safely
// ============================================================
async function callGroqJson(systemPrompt, userPrompt, maxTokens = 4000) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });

  const rawText = response.choices[0].message.content;
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ============================================================
// FUNCTION 1 — Generate Interview Report
// ============================================================
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const systemPrompt = `You are an expert career coach and interview preparation specialist.
Always respond with valid JSON only. No markdown, no explanation, no code blocks — just the raw JSON object.`;

  const userPrompt = `Generate a comprehensive interview preparation report for a candidate applying for a job.

CANDIDATE RESUME:
${resume || "Not provided"}

CANDIDATE SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Return ONLY this exact JSON structure with no extra text:
{
  "matchScore": <number 0-100 indicating candidate-job fit>,
  "title": "<job title from the job description>",
  "technicalQuestions": [
    {
      "question": "<technical interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<how to answer, what points to cover, approach>"
    },
    {
      "question": "<technical interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<how to answer, what points to cover, approach>"
    },
    {
      "question": "<technical interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<how to answer, what points to cover, approach>"
    },
    {
      "question": "<technical interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<how to answer, what points to cover, approach>"
    },
    {
      "question": "<technical interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<how to answer, what points to cover, approach>"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "<behavioral interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<STAR format ideal answer guidance>"
    },
    {
      "question": "<behavioral interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<STAR format ideal answer guidance>"
    },
    {
      "question": "<behavioral interview question>",
      "intention": "<why interviewer asks this>",
      "answer": "<STAR format ideal answer guidance>"
    }
  ],
  "skillGaps": [
    { "skill": "<missing skill>", "severity": "high" },
    { "skill": "<missing skill>", "severity": "medium" },
    { "skill": "<missing skill>", "severity": "low" }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 2,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 3,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 4,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 5,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 6,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 7,
      "focus": "<main focus topic for this day>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    }
  ]
}`;

  try {
    const result = await callGroqJson(systemPrompt, userPrompt, 4000);
    console.log("Interview report generated successfully");
    return result;
  } catch (err) {
    console.error("generateInterviewReport error:", err.message);
    throw new Error("Failed to generate interview report from AI.");
  }
}

// ============================================================
// FUNCTION 2 — Generate Resume PDF (Groq → HTML → Puppeteer)
// ============================================================
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const systemPrompt = `You are an expert ATS resume writer. You write clean, professional, ATS-optimized resumes.
Always respond with valid JSON only. No markdown, no explanation, no code blocks — just the raw JSON object.`;

  const userPrompt = `Generate a professional ATS-optimized resume in HTML format for a candidate tailored to the job description.

CANDIDATE RESUME / EXPERIENCE:
${resume || "Not provided"}

CANDIDATE SELF DESCRIPTION:
${selfDescription || "Not provided"}

TARGET JOB DESCRIPTION:
${jobDescription || "Not provided"}

Return ONLY this exact JSON structure:
{
  "html": "<complete HTML resume content here>"
}

============================
STRICT ATS HTML FORMAT RULES
============================

LAYOUT & STRUCTURE:
- Single column layout only — NO multi-column, NO tables for layout
- Font: Arial, sans-serif throughout
- Font sizes: Name = 26px bold, Section headings = 13px bold uppercase, Body = 12px
- Line height: 1.5
- NO images, NO icons, NO colored background blocks or banner headers
- NO borders except a thin 1px #2563eb bottom border under each section heading

HEADER SECTION (top of resume):
- Full name: font-size 26px, color #2563eb, font-weight bold, margin-bottom 4px
- Contact line below name: phone | email | LinkedIn | GitHub | Portfolio — all on ONE line, color #555, font-size 11px, separator " | "
- NO background color, NO box, NO banner — plain white background only

SECTION HEADINGS:
- Text: color #2563eb, font-size 13px, font-weight bold, text-transform uppercase
- Add: border-bottom: 1px solid #2563eb, padding-bottom: 2px, margin-bottom: 8px, margin-top: 16px

SECTIONS ORDER:
1. Header (name + contact)
2. Professional Summary — 3-4 sentences, keyword-rich, tailored to job description keywords
3. Technical Skills — grouped categories on separate lines, label bold:
   Languages: JavaScript (ES6+), Python, HTML5, CSS3, TypeScript
   Frontend: React.js, Next.js, Tailwind CSS, Bootstrap, Responsive Design
   Backend & DB: Node.js, Express.js, MongoDB, RESTful APIs, JWT Authentication
   DevOps & Tools: Git, GitHub, VS Code, Postman, npm
   (Plain text — NO pill/badge/tag styling, NO colored boxes)
4. Professional Experience — each role:
   - Company + date on same line (date float right or inline, color #555)
   - Job title + location below (italic, color #444)
   - Bullet points using • (bullet character), NOT ul/li tags, quantified achievements
5. Technical Projects — each project:
   - Project Name | Tech Stack (bold) 
   - Bullet points with • and quantified impact
6. Education — Degree, University, Dates, GPA
7. Certifications/Achievements — brief • bullet lines

CRITICAL ATS RULES:
- Do NOT use <ul>, <li>, <ol> tags — use <div> with • character instead
- All layout via <div> with inline styles
- Skills in grouped comma-separated lines — NOT one per line
- Contact info on ONE line with | separators
- Quantify achievements wherever possible
- Sound like a real human professional, NOT AI text
- Max 1-2 A4 pages

OUTPUT: Return only the inner body content as the "html" value. Do NOT wrap with DOCTYPE, html, head, or body tags.`;

  try {
    const jsonContent = await callGroqJson(systemPrompt, userPrompt, 5000);

    if (!jsonContent.html) {
      throw new Error("AI did not return HTML content");
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: white;
      padding: 30px 40px;
      max-width: 750px;
      margin: 0 auto;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${jsonContent.html}
</body>
</html>`;

    const pdfBuffer = await generatePdfFromHtml(fullHtml);
    console.log(
      `Resume PDF generated successfully, size: ${pdfBuffer.length} bytes`,
    );
    return pdfBuffer;
  } catch (err) {
    console.error("generateResumePdf error:", err.message);
    throw new Error("Failed to generate resume PDF from AI.");
  }
}

// ============================================================
// HELPER — Convert HTML to PDF using Puppeteer
// ============================================================
async function generatePdfFromHtml(htmlContent) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
      ],
      timeout: 30000,
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 30000,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfUint8Array = await page.pdf({
      format: "A4",
      margin: {
        top: "15mm",
        bottom: "15mm",
        left: "12mm",
        right: "12mm",
      },
      printBackground: true,
      timeout: 30000,
    });

    return Buffer.from(pdfUint8Array);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Browser close error (non-critical):", closeErr.message);
      }
    }
  }
}

module.exports = { generateInterviewReport, generateResumePdf };
