import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const TEST_AGENT_NAME = "test-agent-xyz";
const ROOT_DIR = path.join(__dirname, "..");

describe("spawn-agent.js", () => {
  beforeEach(() => {
    // Clean up any existing test agent files before each test
    const paths = [
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.agent.json`),
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.prompt.txt`),
      path.join(ROOT_DIR, ".github", "workflows", `${TEST_AGENT_NAME}.workflow.yml`),
      path.join(ROOT_DIR, "docs", "agents", `${TEST_AGENT_NAME}.mdx`),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
  });

  afterEach(() => {
    // Clean up test agent files after each test
    const paths = [
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.agent.json`),
      path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.prompt.txt`),
      path.join(ROOT_DIR, ".github", "workflows", `${TEST_AGENT_NAME}.workflow.yml`),
      path.join(ROOT_DIR, "docs", "agents", `${TEST_AGENT_NAME}.mdx`),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
    // Clean up directories if empty
    const dirs = [
      path.join(ROOT_DIR, "agents"),
      path.join(ROOT_DIR, "docs", "agents"),
    ];
    for (const d of dirs) {
      if (fs.existsSync(d) && fs.readdirSync(d).length === 0) {
        fs.rmdirSync(d);
      }
    }
  });

  it("should show error when no agent name provided", () => {
    let error: Error | null = null;
    try {
      execSync("node scripts/spawn-agent.js", { cwd: ROOT_DIR, encoding: "utf-8" });
    } catch (e: any) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error!.message).toContain("Please provide an agent name");
  });

  it("should create all required files when agent name provided", () => {
    const output = execSync(`node scripts/spawn-agent.js ${TEST_AGENT_NAME}`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    });

    expect(output).toContain(`Created agent: ${TEST_AGENT_NAME}`);

    // Check agent JSON file
    const jsonPath = path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.agent.json`);
    expect(fs.existsSync(jsonPath)).toBe(true);
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expect(jsonContent.id).toBe(TEST_AGENT_NAME);
    expect(jsonContent.name).toBe("Test Agent Xyz");
    expect(jsonContent.role).toBe("worker");
    expect(jsonContent.traits).toContain("emoji-native");
    expect(jsonContent.inherits_from).toBe("base-agent");

    // Check prompt file
    const promptPath = path.join(ROOT_DIR, "agents", `${TEST_AGENT_NAME}.prompt.txt`);
    expect(fs.existsSync(promptPath)).toBe(true);
    const promptContent = fs.readFileSync(promptPath, "utf-8");
    expect(promptContent).toContain("SYSTEM:");
    expect(promptContent).toContain(TEST_AGENT_NAME);

    // Check workflow file
    const workflowPath = path.join(ROOT_DIR, ".github", "workflows", `${TEST_AGENT_NAME}.workflow.yml`);
    expect(fs.existsSync(workflowPath)).toBe(true);
    const workflowContent = fs.readFileSync(workflowPath, "utf-8");
    expect(workflowContent).toContain(`name: ${TEST_AGENT_NAME} Workflow`);
    expect(workflowContent).toContain("workflow_dispatch");

    // Check docs file
    const docPath = path.join(ROOT_DIR, "docs", "agents", `${TEST_AGENT_NAME}.mdx`);
    expect(fs.existsSync(docPath)).toBe(true);
    const docContent = fs.readFileSync(docPath, "utf-8");
    expect(docContent).toContain("# Test Agent Xyz Agent");
    expect(docContent).toContain("Auto-generated");
  });

  it("should convert spaces in agent name to hyphens for agent id", () => {
    const agentNameWithSpaces = "my cool agent";
    const expectedId = "my-cool-agent";
    
    try {
      const output = execSync(`node scripts/spawn-agent.js "${agentNameWithSpaces}"`, {
        cwd: ROOT_DIR,
        encoding: "utf-8",
      });
      expect(output).toContain(`Created agent: ${expectedId}`);

      const jsonPath = path.join(ROOT_DIR, "agents", `${expectedId}.agent.json`);
      expect(fs.existsSync(jsonPath)).toBe(true);
    } finally {
      // Cleanup
      const paths = [
        path.join(ROOT_DIR, "agents", `${expectedId}.agent.json`),
        path.join(ROOT_DIR, "agents", `${expectedId}.prompt.txt`),
        path.join(ROOT_DIR, ".github", "workflows", `${expectedId}.workflow.yml`),
        path.join(ROOT_DIR, "docs", "agents", `${expectedId}.mdx`),
      ];
      for (const p of paths) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
    }
  });
});
