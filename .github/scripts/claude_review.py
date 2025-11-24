#!/usr/bin/env python3
"""
Claude Code Review Script for HD Chart Generator

This script performs automated code reviews using Claude AI for pull requests,
focusing on TypeScript, React, Next.js best practices, and project-specific
requirements like Human Design domain accuracy and German language validation.
"""

import os
import sys
import json
import anthropic
import requests
from pathlib import Path
from typing import List, Dict, Optional

# GitHub API configuration
GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_OWNER = os.environ.get("REPO_OWNER")
REPO_NAME = os.environ.get("REPO_NAME")
PR_NUMBER = os.environ.get("PR_NUMBER")
CHANGED_FILES = os.environ.get("CHANGED_FILES", "").split(",")

# Anthropic API configuration
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

# File patterns to exclude from review
EXCLUDE_PATTERNS = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".gitignore",
    "LICENSE",
]

# Extensions to review
REVIEW_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".yml", ".yaml"]


def should_review_file(filepath: str) -> bool:
    """Determine if a file should be reviewed based on patterns and extensions."""
    if not filepath or filepath.strip() == "":
        return False

    # Check exclude patterns
    for pattern in EXCLUDE_PATTERNS:
        if pattern in filepath:
            return False

    # Check if it has a reviewable extension
    return any(filepath.endswith(ext) for ext in REVIEW_EXTENSIONS)


def get_file_content(filepath: str) -> Optional[str]:
    """Get file content from the repository."""
    try:
        file_path = Path(filepath)
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
    return None


def create_review_prompt(files_content: Dict[str, str]) -> str:
    """Create the code review prompt for Claude."""

    prompt = """You are an expert code reviewer for the Human Design Chart Generator project.

**Project Context:**
- Frontend: Next.js 14+ with TypeScript, React 18+, Tailwind CSS
- Backend: Node.js/Python on Railway (API normalization layer)
- Deployment: Vercel (frontend), Railway (backend)

**Review Focus Areas:**
1. TypeScript type safety and strict null checks
2. React 18+ best practices and hooks usage
3. Next.js 14+ App Router patterns
4. Mobile-first responsive design (min 375px width)
5. German language content validation
6. Human Design domain accuracy (Types: Generatore, Manifestante, Proiettore, Manifestatore, Riflettore)
7. API contract compliance with specs/001-hd-chart-generator/contracts/
8. Error handling with user-friendly German messages
9. Accessibility standards (WCAG AA)
10. Performance optimization
11. Security vulnerabilities (XSS, SQL injection, command injection, OWASP top 10)

**Project Constitution:**
- Specification-first design (no code without clear requirements)
- Minimalist UI (no over-engineering)
- API-agnostic backend (normalization layer required)
- Error-first experience design (graceful error handling)
- Quality over feature completeness

**Quality Gates:**
- Mobile-first: 375px minimum width
- Performance: 3s max chart generation, no layout shifts
- No technical error messages to users (German-only friendly errors)
- TypeScript strict mode compliance
- Visual Bodygraph must render correctly as SVG

**Files to Review:**

"""

    for filepath, content in files_content.items():
        prompt += f"\n## File: {filepath}\n\n```\n{content[:5000]}\n```\n"
        if len(content) > 5000:
            prompt += "\n[Content truncated - file is longer than 5000 characters]\n"

    prompt += """

**Review Instructions:**

Please provide a thorough code review focusing on:
1. Critical issues (security, bugs, breaking changes)
2. Best practices violations
3. Performance concerns
4. Accessibility issues
5. Specification compliance
6. Code quality and maintainability

Format your response as:

**Summary:** Brief overview of changes and overall quality

**Critical Issues:** (if any)
- Issue description with file:line reference
- Why it's critical
- Suggested fix

**Improvements:** (if any)
- Improvement suggestion with file:line reference
- Rationale
- How to implement

**Positive Notes:** (good practices to acknowledge)

Keep feedback constructive, specific, and actionable. Reference line numbers when possible.
"""

    return prompt


def call_claude_api(prompt: str) -> Optional[str]:
    """Call Claude API for code review."""
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY not set")
        return None

    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return message.content[0].text
    except Exception as e:
        print(f"Error calling Claude API: {e}")
        return None


def post_review_comment(review_text: str) -> bool:
    """Post the review as a comment on the pull request."""
    if not GITHUB_TOKEN or not PR_NUMBER:
        print("Error: GITHUB_TOKEN or PR_NUMBER not set")
        return False

    url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/issues/{PR_NUMBER}/comments"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }

    comment_body = f"""## 🤖 Claude Code Review Results

{review_text}

---
*Automated review by Claude Sonnet 4.5*
*Custom agents available: HD Domain Expert, API Integration Specialist, Chart Visualization Specialist, Specification Compliance Agent*
"""

    data = {"body": comment_body}

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        print("Review comment posted successfully")
        return True
    except Exception as e:
        print(f"Error posting review comment: {e}")
        return False


def main():
    """Main execution function."""
    print("Starting Claude Code Review...")
    print(f"PR Number: {PR_NUMBER}")
    print(f"Changed files: {CHANGED_FILES}")

    # Filter files to review
    files_to_review = [f.strip() for f in CHANGED_FILES if should_review_file(f.strip())]

    if not files_to_review:
        print("No files to review (all excluded or non-code files)")
        sys.exit(0)

    print(f"Files to review: {files_to_review}")

    # Get file contents
    files_content = {}
    for filepath in files_to_review:
        content = get_file_content(filepath)
        if content:
            files_content[filepath] = content

    if not files_content:
        print("No file content could be retrieved")
        sys.exit(0)

    # Create review prompt
    prompt = create_review_prompt(files_content)

    # Call Claude API
    print("Calling Claude API for code review...")
    review_result = call_claude_api(prompt)

    if not review_result:
        print("Failed to get review from Claude")
        sys.exit(1)

    print("Review completed, posting comment...")

    # Post review comment
    if post_review_comment(review_result):
        print("Code review process completed successfully")
        sys.exit(0)
    else:
        print("Failed to post review comment")
        sys.exit(1)


if __name__ == "__main__":
    main()
