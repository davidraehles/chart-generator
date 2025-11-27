# Claude Code Review Scripts

This directory contains automation scripts for Claude-powered code reviews on pull requests.

## Setup

### 1. Add ANTHROPIC_API_KEY Secret

To enable Claude code reviews, you need to add your Anthropic API key as a GitHub secret:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your Anthropic API key (get one at https://console.anthropic.com/)
6. Click **Add secret**

### 2. Verify Workflow Permissions

Ensure the workflow has the necessary permissions:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

## How It Works

### Workflow Trigger

The Claude code review workflow (`.github/workflows/claude-code-review.yml`) automatically runs when:
- A pull request is opened
- New commits are pushed to an open PR
- A PR is reopened

Branches monitored:
- `main`
- `claude/**`
- `feature/**`

### Review Process

1. **File Detection**: The workflow identifies all changed files in the PR
2. **Filtering**: Excludes non-code files (lock files, configs, markdown, etc.)
3. **Content Analysis**: Reads the content of changed files
4. **Claude Review**: Sends files to Claude Sonnet 4.5 with project-specific context
5. **Comment Posting**: Posts the review as a PR comment

### Review Focus Areas

Claude reviews code for:
- ✅ TypeScript type safety and strict null checks
- ✅ React 18+ best practices and hooks usage
- ✅ Next.js 14+ App Router patterns
- ✅ Mobile-first responsive design (min 375px)
- ✅ German language content validation
- ✅ Human Design domain accuracy
- ✅ API contract compliance
- ✅ Error handling with user-friendly messages
- ✅ Accessibility standards (WCAG AA)
- ✅ Performance optimization
- ✅ Security vulnerabilities (XSS, injection, OWASP top 10)

### Project Context

Claude is aware of:
- **Architecture**: Next.js 14+ frontend, Node.js/Python backend on Railway
- **Specification**: `specs/001-hd-chart-generator/spec.md` requirements
- **Constitution**: Project principles (specification-first, minimalist UI, API-agnostic, error-first)
- **Quality Gates**: Performance (3s chart generation), mobile-first (375px), German language

### Custom Agents

The review references these custom agents for specialized reviews:
- **HD Domain Expert**: Human Design knowledge and validation
- **API Integration Specialist**: API client design and normalization
- **Chart Visualization Specialist**: Bodygraph SVG rendering
- **Specification Compliance Agent**: Requirements traceability

## Scripts

### `claude_review.py`

Main Python script that:
- Reads changed files from the PR
- Filters reviewable files (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.yml`, `.yaml`)
- Excludes lock files and configs
- Calls Claude API with project context
- Posts review comments to the PR

**Environment Variables:**
- `ANTHROPIC_API_KEY`: Anthropic API key (required)
- `GITHUB_TOKEN`: GitHub token (auto-provided by Actions)
- `PR_NUMBER`: Pull request number (auto-provided)
- `REPO_OWNER`: Repository owner (auto-provided)
- `REPO_NAME`: Repository name (auto-provided)
- `CHANGED_FILES`: Comma-separated list of changed files (from tj-actions/changed-files)

**Dependencies:**
- `anthropic`: Official Anthropic Python SDK
- `requests`: HTTP library for GitHub API calls

## Troubleshooting

### Review Not Running

**Check if ANTHROPIC_API_KEY is set:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify `ANTHROPIC_API_KEY` exists
3. If not, add it following the setup instructions above

**Check workflow permissions:**
1. Go to **Settings** → **Actions** → **General**
2. Ensure **Read and write permissions** is selected

**Check workflow file:**
1. Review `.github/workflows/claude-code-review.yml`
2. Ensure it's on the correct branch
3. Check for syntax errors

### Review Failed

**Check the Actions log:**
1. Go to **Actions** tab
2. Click on the failed workflow run
3. Review the logs for error messages

**Common issues:**
- Invalid API key: Regenerate key at https://console.anthropic.com/
- Rate limiting: Wait and retry
- Network issues: Rerun the workflow
- File too large: Script truncates files over 5000 chars

### Review Not Posted

**Check PR comment permissions:**
1. Workflow needs `pull-requests: write` permission
2. Verify in `.github/workflows/claude-code-review.yml`

**GitHub token issues:**
1. Workflow uses `${{ secrets.GITHUB_TOKEN }}` (auto-provided)
2. Check token has sufficient permissions in repo settings

## Customization

### Modify Review Focus

Edit `claude_review.py` → `create_review_prompt()` function to adjust:
- Review focus areas
- Project context
- Quality gates
- Custom instructions

### Change File Filters

Edit `claude_review.py`:
- `EXCLUDE_PATTERNS`: Add/remove file patterns to exclude
- `REVIEW_EXTENSIONS`: Add/remove file extensions to review

### Adjust Model or Parameters

Edit `claude_review.py` → `call_claude_api()` function:
```python
message = client.messages.create(
    model="claude-sonnet-4-5-20250929",  # Change model here
    max_tokens=4096,  # Adjust token limit
    messages=[{"role": "user", "content": prompt}]
)
```

## Cost Estimation

Claude Sonnet 4.5 pricing (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Typical PR review:**
- 5-10 files changed (~2,000-5,000 lines)
- ~10,000-20,000 input tokens
- ~2,000-4,000 output tokens
- **Cost per review: $0.06 - $0.15**

**Monthly estimate (30 PRs):**
- ~$2-$5 per month for regular development

## Security

- **API Key**: Never commit `ANTHROPIC_API_KEY` to the repository
- **Secrets**: Always use GitHub Secrets for sensitive values
- **Code Access**: Review script only reads files in the PR, doesn't modify code
- **Network**: Claude API calls are made over HTTPS

## Support

For issues or questions:
1. Check [Claude API documentation](https://docs.anthropic.com/)
2. Review [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Open an issue in this repository
