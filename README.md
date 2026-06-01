# Skill Analyzer

Skill Analyzer is a small Node.js script that scans folders full of JavaScript or TypeScript projects and creates a single `analysis.json` report. It is useful when you have a learning folder, project archive, bootcamp workspace, or client/project directory and want a quick overview of what is inside.

The script looks for `package.json` files, reads each project's dependencies, README, scripts, lock files, and file names, then infers the project's type, purpose, and technology stack.

## What It Tells You

For each project, the report can identify:

- Project type, such as `Full-stack web app`, `Backend API / service`, `Mobile app`, `CLI / developer tool`, or `Library / package`
- Primary purpose, such as AI apps, dashboards, e-commerce, authentication, APIs, testing, or developer tools
- Technology stack grouped by area, including frontend, backend, database, AI, mobile, desktop, testing, deployment, and tooling
- Package manager, based on lock files like `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or Bun lock files
- Useful npm scripts, such as `dev`, `start`, `build`, `test`, `lint`, and other custom scripts
- Evidence used for the guess, including README summary, package description, matched keywords, and scanned file count

It also creates overall summaries across all scanned projects and per root folder.

## Requirements

- Node.js 20 or newer is recommended
- No npm install is required
- The script only uses built-in Node.js modules: `fs` and `path`

If an older Node.js version complains about `import` syntax, upgrade Node.js or place a `package.json` file beside `analyzer.js` with:

```json
{
  "type": "module"
}
```

## Usage

Open a terminal in this folder:

```powershell
cd "E:\personal projects\scripts\skill analyzer"
```

Scan the default folder:

```powershell
node .\analyzer.js
```

By default, the script scans:

```text
E:\genAi_COHORT
```

Scan a specific folder:

```powershell
node .\analyzer.js "E:\genAi_COHORT"
```

Scan multiple folders:

```powershell
node .\analyzer.js "E:\genAi_COHORT" "D:\Projects" "C:\Users\Aksh\Desktop\apps"
```

Quote folder paths when they contain spaces.

## Output

After the scan finishes, the script writes:

```text
analysis.json
```

The file is created in the current working directory and is overwritten each time you run the script.

Example output shape:

```json
{
  "generatedAt": "2026-06-01T12:00:00.000Z",
  "rootDirs": ["E:\\genAi_COHORT"],
  "skippedRootDirs": [],
  "summary": {
    "totalProjects": 12,
    "projectTypes": [],
    "workAreas": [],
    "technologies": []
  },
  "summariesByRoot": [],
  "projects": []
}
```

Each item in `projects` includes details like:

```json
{
  "name": "my-next-app",
  "folder": "E:\\genAi_COHORT\\my-next-app",
  "projectType": "Full-stack web app",
  "primaryPurpose": "AI / LLM apps",
  "workAreas": ["AI / LLM apps", "APIs / backend services"],
  "whatItDoes": "Likely a full-stack web app focused on AI / LLM apps using Next.js, React, OpenAI.",
  "techStack": {
    "frontend": ["Next.js", "React"],
    "ai": ["OpenAI"],
    "runtime": ["Node.js"]
  },
  "packageManager": "npm",
  "scripts": ["dev", "build", "start"],
  "evidence": {
    "description": "",
    "readmeSummary": "",
    "matchedSignals": ["openai", "chatbot"],
    "scannedFileCount": 120
  }
}
```

## How It Works

1. Takes root folders from command-line arguments.
2. If no folders are provided, uses `DEFAULT_ROOT_DIRS` from `analyzer.js`.
3. Recursively finds every `package.json` file under those roots.
4. Skips common heavy folders like `node_modules`, `.git`, `dist`, `build`, `.next`, and `coverage`.
5. Reads project metadata, dependencies, README text, scripts, lock files, and up to 300 file paths per project.
6. Applies rule-based detection for technologies and project purposes.
7. Writes the final JSON report to `analysis.json`.

## Customization

You can adjust the script by editing constants near the top of `analyzer.js`:

- `DEFAULT_ROOT_DIRS`: folders to scan when no command-line arguments are provided
- `OUTPUT_FILE`: output JSON file name
- `IGNORE_DIRS`: folders that should not be scanned
- `TECH_RULES`: package and file rules for detecting technologies
- `PURPOSE_RULES`: keyword and package rules for detecting project purpose

For example, to change the default folder:

```js
const DEFAULT_ROOT_DIRS = ["D:\\Projects"];
```

## Troubleshooting

If you see `No valid folders to scan.`, check that the folder path exists and is quoted correctly.

If the report has `0` projects, the scanned folders may not contain any `package.json` files.

If a project looks misclassified, check its `evidence.matchedSignals` field. The analyzer uses simple rules based on package names, README content, package descriptions, script names, and file paths, so it is a helpful overview rather than a perfect classifier.

## Limitations

- It only detects projects that contain `package.json`.
- It does not deeply analyze source code behavior.
- Purpose detection is heuristic and keyword-based.
- File scanning is capped at 300 file paths per project.
- It is focused on JavaScript and TypeScript ecosystems.
