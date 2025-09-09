#!/usr/bin/env node

import { hotReload } from "../dist/utils/reload.js";
import path from "path";
// import { exec } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isValidPackageName(name) {
  return /^([a-z0-9\-]+)$/.test(name); // Allow only lowercase letters, numbers, and dashes
}


const command = process.argv
const args = process.argv[2];


if (args === "start") {
  // Look for package.json
  const packageJsonPath = path.resolve(process.cwd(), "package.json");
  let entryFile = null;

  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (packageJson.main) {
        entryFile = packageJson.main;
      }
    } catch (err) {
      console.error("Error reading package.json:", err);
      process.exit(1);
    }
  }

  // Check for possible entry files if package.json doesn't contain one
  if (!entryFile) {
    const possibleFiles = ["index.js", "index.ts", "main.js", "main.ts"];
    entryFile = possibleFiles.find((file) => fs.existsSync(path.resolve(process.cwd(), file)));
  }

  // Exit if no file found
  if (!entryFile) {
    console.error("Error: No entry file found. Expected one of index.js, index.ts, main.js, or main.ts.");
    process.exit(1);
  }

  // Resolve path and start the hot reload server
  const filePath = path.resolve(process.cwd(), entryFile);
  console.log(`🚀 Starting: ${filePath}`);
  hotReload(filePath);
}
 else if (args === "init") {
  if (command.length < 4) {
    console.log("Please provide a project name.");
    process.exit(1);
  }

  const projectName = command[3];

  if (!isValidPackageName(projectName)) {
    console.log("Invalid project name. Use only lowercase letters, numbers, dashes, and dots.");
    process.exit(1);
  }

  
  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log("Project already exists. Please choose a different name.");
    process.exit(1);
  }

  fs.mkdirSync(projectPath, { recursive: true });

  // ✅ Copy template files
  const templatePath = path.resolve(__dirname, "../template");
  try {
    fs.cpSync(templatePath, projectPath, { recursive: true });
  } catch (err) {
    console.error("Error Setting up project:", err);
    process.exit(1);
  }

  // ✅ Generate package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "",
    main: "index.js",
    type: "module",
    scripts: {
      start: "node index.js",
      dev: "station start",
    },
    dependencies: {
      "station-x": "^3.0.0",
    },
    devDependencies: {},
  };

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  console.log("🎉 Project created successfully!");
  console.log(`👉 Next steps:\n   cd ${projectName}\n   npm install\n   npm run dev`);
}
  else if  (args === 'help') {
  console.log("Usage: station <command>");
  console.log("Commands:");
  console.log("  start - Start the server");
  console.log("  init <project-name> - Create a new project");
  console.log("  help - Display help information");
} else {
  console.log("Invalid command.");
  console.log("Run 'station help' for a list of commands.");
  process.exit(1);
}