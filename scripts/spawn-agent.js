const fs = require("fs");
const path = require("path");

const agentName = process.argv[2];

if (!agentName) {
  console.error("❌ Please provide an agent name: `npm run spawn-agent <agent-name>`");
  process.exit(1);
}

const toTitleCase = (str) => str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const agentId = agentName.toLowerCase().replace(/\s+/g, "-");
const displayName = toTitleCase(agentId);

const output = {
  id: agentId,
  name: displayName,
  role: "worker",
  traits: ["emoji-native"],
  inputs: [],
  outputs: [],
  description: `This is the ${displayName} agent.`,
  triggers: [],
  inherits_from: "base-agent"
};

// Paths
const jsonPath = `agents/${agentId}.agent.json`;
const promptPath = `agents/${agentId}.prompt.txt`;
const workflowPath = `.github/workflows/${agentId}.workflow.yml`;
const docPath = `docs/agents/${agentId}.mdx`;

// Files
fs.mkdirSync("agents", { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));

fs.writeFileSync(promptPath, `SYSTEM:\nYou are the ${displayName} agent. Your job is to...`);

fs.mkdirSync(".github/workflows", { recursive: true });
fs.writeFileSync(workflowPath, `name: ${displayName} Workflow\non:\n  workflow_dispatch:\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "${displayName} agent triggered!"`);

fs.mkdirSync("docs/agents", { recursive: true });
fs.writeFileSync(docPath, `# ${displayName} Agent\n\nAuto-generated.\n\n## Purpose\nTBD`);

console.log(`✅ Created agent: ${agentId}`);
console.log(`├─ ${jsonPath}`);
console.log(`├─ ${promptPath}`);
console.log(`├─ ${workflowPath}`);
console.log(`└─ ${docPath}`);
