# Repository operating instructions

## GitHub operations

- Always use the GitHub Paperclip connector for repository reads and writes. Do not use `git push`, GitHub CLI, or local Git credentials for remote GitHub operations.
- For Wendoo site development, publish work to a non-production Preview branch. Keep `main` and the production maintenance page unchanged unless the owner explicitly authorizes a release.

## Preview integration preflight

- Treat each approved page handoff as the source of truth. Carry its exact image assets and page-specific visual requirements into the Preview branch; do not substitute media or shared color tokens during integration.
- Before publishing, check every local image reference against a tracked file on the target branch. Prefer committed files under `assets/` over large inline data URLs. Check path case and extensions.
- Check page-scoped color requirements against the computed shared tokens. Use page-scoped variables when a page has an explicit palette so later shared-token edits cannot silently recolor it.
- After the Preview build is ready, open each changed route and verify its referenced media and styles load from the deployed URL. Compare the deployed result with the approved handoff evidence before sharing the link.
- Record the Preview commit, deployment URL, route checks, and any remaining issue in the owning Paperclip task.

## Independent Playwright release gate

- Before reporting a page task complete or asking the owner to review a Preview, NightWing must use Playwright against the actual protected Vercel Preview, not only a local server or intercepted responses.
- NightWing must check the deployed commit and route, capture desktop and mobile screenshots, check console/network errors, verify image HTTP responses and decoded natural dimensions, compare computed palette values with the approved handoff, and check navigation and noindex.
- For protected Previews, authenticate the Playwright context with a managed Vercel browser session or the Vercel Protection Bypass for Automation HTTP header. Store bypass secrets only in the runner secret store or environment; never put them in source, URLs, logs, screenshots, or Paperclip comments. Keep Preview protection and noindex enabled.
- If NightWing cannot access the deployed Preview, mark the QA result blocked and name the access needed. Local browser checks are useful supplemental evidence but do not pass the deployed-preview gate.
- Do not tell the owner that a fix is complete or send a review link until NightWing records a passing deployed-browser review against the approved evidence. Route any failure back to the implementation owner with the failing route, screenshot, request/status evidence, and root cause.
