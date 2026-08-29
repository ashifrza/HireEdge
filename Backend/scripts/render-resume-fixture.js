const fs = require("fs");
const path = require("path");
const { generateResumePdf } = require("../src/services/ai.service");

const outputPath = path.resolve(__dirname, "../../output/pdf/hireedge-ats-resume-sample.pdf");

const fixture = {
  schemaVersion: 2,
  contact: {
    fullName: "Ashif Rza",
    email: "ashif.rza@example.com",
    phone: "+91 90000 00000",
    location: "Gurugram, India",
    links: ["linkedin.com/in/ashif-rza", "github.com/ashifrza18"],
  },
  targetTitle: "Frontend Developer",
  summary: "Frontend developer with hands-on experience building responsive React interfaces and integrating REST APIs. Skilled in JavaScript, HTML, CSS, Git, and component-based development, with a focus on accessible user experiences and maintainable code.",
  skills: [
    { category: "Frontend", items: ["React", "JavaScript", "HTML5", "CSS3", "Responsive Design"] },
    { category: "Backend & APIs", items: ["Node.js", "Express.js", "REST APIs"] },
    { category: "Tools", items: ["Git", "GitHub", "Postman", "Chrome DevTools"] },
  ],
  experience: [
    {
      title: "Frontend Developer Intern",
      company: "Syntechxhub",
      location: "Ranchi, India",
      dates: "Nov 2025 - Dec 2025",
      bullets: [
        "Built reusable React components from design references for responsive web pages.",
        "Integrated REST API data and added loading, empty, and error states to user flows.",
        "Tested layouts across modern browsers and resolved styling and interaction defects.",
      ],
    },
  ],
  projects: [
    {
      name: "HireEdge",
      technologies: ["React", "Node.js", "Express.js", "MongoDB"],
      link: "github.com/ashifrza18/HireEdge",
      bullets: [
        "Developed an application workflow that compares candidate information with target job requirements.",
        "Implemented resume upload, structured interview plans, and downloadable ATS-friendly PDF output.",
      ],
    },
    {
      name: "Stock Insight Dashboard",
      technologies: ["React", "Flask", "REST APIs"],
      link: "",
      bullets: [
        "Created a responsive dashboard for presenting market data returned by backend APIs.",
        "Separated UI, API, and state logic to keep features easier to test and maintain.",
      ],
    },
  ],
  education: [
    {
      qualification: "Bachelor of Computer Applications",
      institution: "Example University",
      location: "India",
      dates: "2022 - 2025",
      details: "Coursework: Data Structures, Web Development, Database Management Systems",
    },
  ],
  certifications: [],
  supportedKeywords: ["React", "JavaScript", "REST APIs", "Git", "Responsive Design"],
};

async function main() {
  const result = await generateResumePdf({
    resume: "",
    selfDescription: "",
    jobDescription: "Frontend developer role requiring React, JavaScript, REST APIs, Git, and responsive design.",
    atsResume: fixture,
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.pdfBuffer);
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
