# GitHub Copilot Chat Modes

Custom chat modes for GitHub Copilot to enhance your development workflow. These modes provide specialized AI assistance for different tasks.

> 📚 **Reference**: [Awesome GitHub Copilot](https://github.com/github/awesome-copilot) - Community collection of custom agents, prompts, and instructions.

## Usage

In VS Code with GitHub Copilot Chat, use these modes by selecting them from the chat mode picker or referencing them with `@workspace`.

## Available Chat Modes

### Speckit Workflow (Migrated from Claude Agents)

Feature specification and implementation workflow:

| Mode | Description |
|------|-------------|
| `specify` | Create feature specifications from natural language descriptions |
| `clarify` | Identify and resolve ambiguities in feature specs |
| `plan` | Generate technical implementation plans with design artifacts |
| `tasks` | Create dependency-ordered task breakdowns |
| `implement` | Execute implementation plans task by task |
| `analyze` | Cross-artifact consistency and quality analysis |
| `checklist` | Generate requirements quality validation checklists |
| `constitution` | Manage project principles and guidelines |
| `taskstoissues` | Convert tasks.md to GitHub Issues |

### Technology Experts

Specialized assistance for project technologies:

| Mode | Description |
|------|-------------|
| `nextjs-expert` | Next.js 16 with App Router, Server Components, Turbopack |
| `fastapi-expert` | Python FastAPI applications with async patterns |
| `playwright-tester` | End-to-end testing with Playwright |
| `accessibility` | WCAG 2.1/2.2 compliance and inclusive UX |

### General Development

| Mode | Description |
|------|-------------|
| `plan-mode` | Strategic planning and architecture analysis |
| `janitor` | Code cleanup, tech debt elimination, simplification |
| `adr-generator` | Create Architectural Decision Records |

## Project-Specific Recommendations

This chart-generator project uses:
- **Frontend**: Next.js 16+ with TypeScript, React 19, Tailwind CSS
- **Backend**: Python 3.11 + FastAPI 0.115.0, pyswisseph
- **Testing**: Playwright for E2E testing

Recommended modes for this project:
1. `nextjs-expert` - Frontend development
2. `fastapi-expert` - Backend API development
3. `playwright-tester` - E2E test creation
4. `specify` → `plan` → `tasks` → `implement` - Full feature workflow

## File Format

Chat modes use the `.chatmode.md` format with YAML frontmatter:

```yaml
---
name: "Mode Display Name"
description: "Brief description of what this mode does"
tools: ["tool1", "tool2", "..."]
model: "Optional model preference"
---

# Mode Instructions

Your detailed instructions here...
```

## Adding New Modes

1. Create a new `.chatmode.md` file in this directory
2. Add YAML frontmatter with `name`, `description`, and `tools`
3. Write clear instructions for the AI assistant
4. Reference related modes or workflows

## Resources

- [VS Code Copilot Chat Documentation](https://code.visualstudio.com/docs/copilot/chat/copilot-chat)
- [Custom Chat Modes](https://code.visualstudio.com/docs/copilot/chat/chat-modes)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot)
