import fs from "fs";
import path from "path";

const ROOT_DIRS = process.argv.slice(2);
const DEFAULT_ROOT_DIRS = ["E:\\genAi_COHORT"];
const OUTPUT_FILE = "analysis.json";

const IGNORE_DIRS = new Set([
  ".cache",
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "vendor",
]);

const TECH_RULES = [
  { name: "Next.js", area: "frontend", packages: ["next"] },
  { name: "React", area: "frontend", packages: ["react"] },
  { name: "Vite", area: "frontend", packages: ["vite"] },
  { name: "Vue", area: "frontend", packages: ["vue"] },
  { name: "Nuxt", area: "frontend", packages: ["nuxt"] },
  { name: "Angular", area: "frontend", packages: ["@angular/core"] },
  { name: "Svelte", area: "frontend", packages: ["svelte", "@sveltejs/kit"] },
  { name: "Tailwind CSS", area: "frontend", packages: ["tailwindcss"] },
  { name: "Bootstrap", area: "frontend", packages: ["bootstrap"] },
  { name: "Material UI", area: "frontend", packages: ["@mui/material", "@material-ui/core"] },
  { name: "Framer Motion", area: "frontend", packages: ["framer-motion"] },
  { name: "Redux", area: "frontend", packages: ["redux", "@reduxjs/toolkit"] },
  { name: "Zustand", area: "frontend", packages: ["zustand"] },

  { name: "Node.js", area: "runtime", packages: [] },
  { name: "Express", area: "backend", packages: ["express"] },
  { name: "Fastify", area: "backend", packages: ["fastify"] },
  { name: "Hono", area: "backend", packages: ["hono"] },
  { name: "NestJS", area: "backend", packages: ["@nestjs/core"] },
  { name: "Socket.IO", area: "backend", packages: ["socket.io", "socket.io-client"] },
  { name: "GraphQL", area: "backend", packages: ["graphql", "apollo-server", "@apollo/server"] },

  { name: "Prisma", area: "database", packages: ["prisma", "@prisma/client"] },
  { name: "Drizzle ORM", area: "database", packages: ["drizzle-orm", "drizzle-kit"] },
  { name: "Mongoose", area: "database", packages: ["mongoose"] },
  { name: "MongoDB", area: "database", packages: ["mongodb", "mongoose"] },
  { name: "PostgreSQL", area: "database", packages: ["pg", "postgres"] },
  { name: "MySQL", area: "database", packages: ["mysql", "mysql2"] },
  { name: "SQLite", area: "database", packages: ["sqlite", "sqlite3", "better-sqlite3"] },
  { name: "Supabase", area: "database", packages: ["@supabase/supabase-js"] },
  { name: "Firebase", area: "database", packages: ["firebase", "firebase-admin"] },

  { name: "OpenAI", area: "ai", packages: ["openai", "@ai-sdk/openai"] },
  { name: "AI SDK", area: "ai", packages: ["ai"] },
  { name: "LangChain", area: "ai", packages: ["langchain", "@langchain/core", "@langchain/openai"] },
  { name: "Anthropic", area: "ai", packages: ["@anthropic-ai/sdk"] },
  { name: "Google Gemini", area: "ai", packages: ["@google/generative-ai"] },
  { name: "Pinecone", area: "ai", packages: ["@pinecone-database/pinecone"] },
  { name: "Chroma", area: "ai", packages: ["chromadb"] },

  { name: "Three.js", area: "creative", packages: ["three", "@react-three/fiber", "@react-three/drei"] },
  { name: "GSAP", area: "creative", packages: ["gsap"] },
  { name: "Phaser", area: "creative", packages: ["phaser"] },
  { name: "Matter.js", area: "creative", packages: ["matter-js"] },

  { name: "Expo", area: "mobile", packages: ["expo"] },
  { name: "React Native", area: "mobile", packages: ["react-native"] },
  { name: "Electron", area: "desktop", packages: ["electron"] },

  { name: "TypeScript", area: "tooling", packages: ["typescript"] },
  { name: "ESLint", area: "tooling", packages: ["eslint"] },
  { name: "Webpack", area: "tooling", packages: ["webpack"] },
  { name: "Rollup", area: "tooling", packages: ["rollup"] },
  { name: "Tsup", area: "tooling", packages: ["tsup"] },
  { name: "Docker", area: "deployment", packages: [] },
  { name: "Vercel", area: "deployment", packages: ["vercel"] },

  { name: "Jest", area: "testing", packages: ["jest"] },
  { name: "Vitest", area: "testing", packages: ["vitest"] },
  { name: "Playwright", area: "testing", packages: ["@playwright/test", "playwright"] },
  { name: "Cypress", area: "testing", packages: ["cypress"] },
];

const PURPOSE_RULES = [
  {
    label: "AI / LLM apps",
    keywords: ["ai", "llm", "chatbot", "prompt", "rag", "embedding", "vector", "openai", "langchain", "gemini"],
    packages: ["openai", "ai", "@ai-sdk/openai", "langchain", "@langchain/openai", "@google/generative-ai", "@anthropic-ai/sdk"],
  },
  {
    label: "E-commerce / payments",
    keywords: ["cart", "checkout", "shop", "store", "product", "payment", "stripe", "order"],
    packages: ["stripe", "@stripe/stripe-js"],
  },
  {
    label: "Dashboards / analytics",
    keywords: ["dashboard", "analytics", "chart", "admin", "report", "metric", "recharts"],
    packages: ["recharts", "chart.js", "d3", "nivo", "victory"],
  },
  {
    label: "Real-time / chat systems",
    keywords: ["chat", "realtime", "real-time", "socket", "websocket", "room", "message"],
    packages: ["socket.io", "socket.io-client", "ws"],
  },
  {
    label: "Authentication / user systems",
    keywords: ["auth", "login", "signup", "session", "user", "jwt", "clerk"],
    packages: ["next-auth", "auth.js", "@clerk/nextjs", "jsonwebtoken", "bcrypt", "bcryptjs", "passport"],
  },
  {
    label: "CRUD / database apps",
    keywords: ["crud", "todo", "notes", "task", "database", "schema", "prisma", "mongo"],
    packages: ["prisma", "@prisma/client", "mongoose", "mongodb", "drizzle-orm", "@supabase/supabase-js", "firebase"],
  },
  {
    label: "APIs / backend services",
    keywords: ["api", "server", "endpoint", "middleware", "route", "rest", "graphql"],
    packages: ["express", "fastify", "hono", "@nestjs/core", "graphql", "@apollo/server"],
  },
  {
    label: "Portfolio / landing pages",
    keywords: ["portfolio", "landing", "resume", "personal site", "agency", "homepage"],
    packages: [],
  },
  {
    label: "3D / interactive visuals",
    keywords: ["3d", "webgl", "canvas", "animation", "interactive", "three"],
    packages: ["three", "@react-three/fiber", "gsap", "matter-js", "phaser"],
  },
  {
    label: "Mobile apps",
    keywords: ["mobile", "android", "ios", "expo", "react native"],
    packages: ["expo", "react-native"],
  },
  {
    label: "Desktop apps",
    keywords: ["desktop", "electron"],
    packages: ["electron"],
  },
  {
    label: "Developer tools / CLIs",
    keywords: ["cli", "tool", "generator", "script", "automation", "scaffold"],
    packages: ["commander", "yargs", "inquirer", "oclif"],
  },
  {
    label: "Testing / automation",
    keywords: ["test", "e2e", "automation", "browser", "playwright", "cypress"],
    packages: ["@playwright/test", "playwright", "cypress", "jest", "vitest"],
  },
];

function getAllProjects(dir) {
  return fs.readdirSync(dir).filter((file) =>
    fs.statSync(path.join(dir, file)).isDirectory()
  );
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function getDependencies(pkg) {
  if (!pkg) return {};

  return {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {}),
    ...(pkg.optionalDependencies || {}),
  };
}

function hasPackage(deps, packageNames) {
  return packageNames.some((packageName) => deps[packageName]);
}

function findPackageJsonFiles(dir, results = []) {
  for (const entry of safeReadDir(dir)) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        findPackageJsonFiles(fullPath, results);
      }
      continue;
    }

    if (entry.isFile() && entry.name === "package.json") {
      results.push(fullPath);
    }
  }

  return results;
}

function listProjectFiles(projectPath, maxFiles = 300) {
  const files = [];

  function walk(currentDir) {
    if (files.length >= maxFiles) return;

    for (const entry of safeReadDir(currentDir)) {
      if (files.length >= maxFiles) return;
      if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(projectPath, fullPath).replaceAll("\\", "/");

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(relativePath);
      }
    }
  }

  walk(projectPath);
  return files;
}

function readProjectReadme(projectPath) {
  const readme = safeReadDir(projectPath).find((entry) =>
    entry.isFile() && /^readme\.(md|txt|mdx)$/i.test(entry.name)
  );

  return readme ? readText(path.join(projectPath, readme.name)) : "";
}

function cleanMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractReadmeSummary(readmeText) {
  if (!readmeText) return "";

  const lines = readmeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      line &&
      !line.startsWith("[!") &&
      !line.startsWith("![") &&
      !line.startsWith("<") &&
      !line.startsWith("```")
    );

  const firstUsefulBlock = lines.find((line) => cleanMarkdown(line).length > 30);
  const summary = cleanMarkdown(firstUsefulBlock || lines.join(" "));

  return summary.length > 240 ? `${summary.slice(0, 237)}...` : summary;
}

function detectPackageManager(projectPath) {
  const lockFiles = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
  ];

  const match = lockFiles.find(([lockFile]) => fs.existsSync(path.join(projectPath, lockFile)));
  return match ? match[1] : "unknown";
}

function detectTechStack(pkg, projectPath, projectFiles) {
  const deps = getDependencies(pkg);
  const techStack = {
    frontend: [],
    backend: [],
    database: [],
    ai: [],
    creative: [],
    mobile: [],
    desktop: [],
    runtime: [],
    tooling: [],
    testing: [],
    deployment: [],
  };

  for (const rule of TECH_RULES) {
    const hasDependencyMatch = rule.packages.length > 0 && hasPackage(deps, rule.packages);
    const hasFileMatch =
      (rule.name === "TypeScript" && projectFiles.some((file) => file.endsWith(".ts") || file.endsWith(".tsx") || file === "tsconfig.json")) ||
      (rule.name === "Docker" && projectFiles.some((file) => /^dockerfile$/i.test(path.basename(file)) || file === "docker-compose.yml"));

    if (hasDependencyMatch || hasFileMatch) {
      techStack[rule.area].push(rule.name);
    }
  }

  if (Object.keys(deps).length > 0 && !techStack.runtime.includes("Node.js")) {
    techStack.runtime.unshift("Node.js");
  }

  return Object.fromEntries(
    Object.entries(techStack).filter(([, technologies]) => technologies.length > 0)
  );
}

function flattenTechStack(techStack) {
  return [...new Set(Object.values(techStack).flat())];
}

function detectProjectType(pkg, projectFiles = []) {
  if (!pkg) return "Unknown project";

  const deps = getDependencies(pkg);

  if (projectFiles.some((file) => file === "manifest.json")) return "Browser extension";
  if (pkg.bin || hasPackage(deps, ["commander", "yargs", "inquirer", "oclif"])) return "CLI / developer tool";
  if (hasPackage(deps, ["electron"])) return "Desktop app";
  if (hasPackage(deps, ["expo", "react-native"])) return "Mobile app";
  if (hasPackage(deps, ["next"])) return "Full-stack web app";
  if (hasPackage(deps, ["@nestjs/core", "express", "fastify", "hono"])) return "Backend API / service";
  if (hasPackage(deps, ["three", "@react-three/fiber", "phaser", "matter-js"])) return "Creative interactive app";
  if (hasPackage(deps, ["react", "vue", "svelte", "@angular/core"])) return "Frontend web app";
  if (hasPackage(deps, ["tsup", "rollup"]) || pkg.main || pkg.module || pkg.exports) return "Library / package";

  return "General JavaScript project";
}

function extractTech(pkg) {
  if (!pkg) return [];

  return Object.keys(getDependencies(pkg));
}

function scorePurposeRule(rule, deps, searchableText) {
  let score = 0;
  const evidence = [];

  for (const packageName of rule.packages) {
    if (deps[packageName]) {
      score += 3;
      evidence.push(packageName);
    }
  }

  for (const keyword of rule.keywords) {
    if (searchableText.includes(keyword.toLowerCase())) {
      score += 1;
      evidence.push(keyword);
    }
  }

  return { score, evidence: [...new Set(evidence)] };
}

function detectPurposes(pkg, readmeText, projectFiles) {
  const deps = getDependencies(pkg);
  const searchableText = [
    pkg?.name,
    pkg?.description,
    Object.keys(pkg?.scripts || {}).join(" "),
    readmeText,
    projectFiles.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return PURPOSE_RULES
    .map((rule) => {
      const { score, evidence } = scorePurposeRule(rule, deps, searchableText);
      return { label: rule.label, score, evidence };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function describeProject(pkg, readmeSummary, projectType, purposes, tech) {
  if (pkg?.description) return pkg.description;
  if (readmeSummary) return readmeSummary;

  const purposeText = purposes.length
    ? purposes.map((purpose) => purpose.label.toLowerCase()).join(", ")
    : "general development";
  const techText = tech.length ? ` using ${tech.slice(0, 5).join(", ")}` : "";

  return `Likely a ${projectType.toLowerCase()} focused on ${purposeText}${techText}.`;
}

function summarizeScripts(scripts = {}) {
  const importantScriptNames = ["dev", "start", "build", "test", "lint", "preview", "deploy"];
  const scriptNames = Object.keys(scripts);
  const importantScripts = scriptNames.filter((scriptName) => importantScriptNames.includes(scriptName));
  const customScripts = scriptNames.filter((scriptName) => !importantScriptNames.includes(scriptName));

  return [...importantScripts, ...customScripts].slice(0, 12);
}

function analyzeProject(projectPath) {
  const pkgPath = path.join(projectPath, "package.json");
  const pkg = readJSON(pkgPath);

  const tech = extractTech(pkg);
  const type = detectProjectType(pkg);

  return {
    name: path.basename(projectPath),
    type,
    tech: tech.slice(0, 10),
  };
}

function detectProjectWork(projectPath, pkg) {
  const projectFiles = listProjectFiles(projectPath);
  const readmeText = readProjectReadme(projectPath);
  const readmeSummary = extractReadmeSummary(readmeText);
  const techStack = detectTechStack(pkg, projectPath, projectFiles);
  const tech = flattenTechStack(techStack);
  const projectType = detectProjectType(pkg, projectFiles);
  const purposes = detectPurposes(pkg, readmeText, projectFiles);
  const purposeLabels = purposes.map((purpose) => purpose.label);
  const whatItDoes = describeProject(pkg, readmeSummary, projectType, purposes, tech);
  const primaryPurpose = purposeLabels[0] || projectType;

  return {
    name: pkg?.name || path.basename(projectPath),
    folder: projectPath,
    projectType,
    primaryPurpose,
    workAreas: purposeLabels,
    whatItDoes,
    techStack,
    tech,
    packageManager: detectPackageManager(projectPath),
    scripts: summarizeScripts(pkg?.scripts),
    evidence: {
      description: pkg?.description || "",
      readmeSummary,
      matchedSignals: purposes.flatMap((purpose) => purpose.evidence).slice(0, 12),
      scannedFileCount: projectFiles.length,
    },
  };
}

function countValues(values) {
  const counts = new Map();

  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

function buildOverallSummary(projects) {
  return {
    totalProjects: projects.length,
    projectTypes: countValues(projects.map((project) => project.projectType)),
    workAreas: countValues(projects.flatMap((project) => project.workAreas)),
    technologies: countValues(projects.flatMap((project) => project.tech)),
  };
}

function getScanRoots() {
  return ROOT_DIRS.length > 0 ? ROOT_DIRS : DEFAULT_ROOT_DIRS;
}

function normalizePath(filePath) {
  return path.resolve(filePath).toLowerCase();
}

function collectPackageFiles(rootDirs) {
  const validRoots = [];
  const skippedRoots = [];
  const packageFileMap = new Map();

  for (const rootDir of rootDirs) {
    const resolvedRoot = path.resolve(rootDir);

    if (!fs.existsSync(resolvedRoot)) {
      skippedRoots.push({
        rootDir,
        reason: "Folder does not exist",
      });
      continue;
    }

    validRoots.push(resolvedRoot);

    for (const packageFile of findPackageJsonFiles(resolvedRoot)) {
      packageFileMap.set(normalizePath(packageFile), packageFile);
    }
  }

  return {
    validRoots,
    skippedRoots,
    packageFiles: [...packageFileMap.values()],
  };
}

function buildRootSummaries(rootDirs, projects) {
  return rootDirs.map((rootDir) => {
    const normalizedRoot = normalizePath(rootDir);
    const rootProjects = projects.filter((project) =>
      normalizePath(project.folder).startsWith(normalizedRoot)
    );

    return {
      rootDir,
      summary: buildOverallSummary(rootProjects),
    };
  });
}

function run() {
  const requestedRootDirs = getScanRoots();
  const { validRoots, skippedRoots, packageFiles } = collectPackageFiles(requestedRootDirs);

  if (validRoots.length === 0) {
    console.error("No valid folders to scan.");
    for (const skippedRoot of skippedRoots) {
      console.error(`Skipped ${skippedRoot.rootDir}: ${skippedRoot.reason}`);
    }
    process.exit(1);
  }

  const projects = packageFiles
    .map((pkgPath) => {
      const projectPath = path.dirname(pkgPath);
      const pkg = readJSON(pkgPath);
      return detectProjectWork(projectPath, pkg);
    })
    .sort((a, b) => a.folder.localeCompare(b.folder));

  const result = {
    generatedAt: new Date().toISOString(),
    rootDirs: validRoots,
    skippedRootDirs: skippedRoots,
    summary: buildOverallSummary(projects),
    summariesByRoot: buildRootSummaries(validRoots, projects),
    projects,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`Analysis complete -> ${OUTPUT_FILE}`);
  console.log(`Scanned ${projects.length} projects across ${validRoots.length} folder(s).`);

  if (skippedRoots.length > 0) {
    console.log(`Skipped ${skippedRoots.length} missing folder(s). Check skippedRootDirs in ${OUTPUT_FILE}.`);
  }
}

run();
