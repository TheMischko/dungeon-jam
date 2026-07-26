---
mode: Agent
---

Ultimate Prompt for Generating an AGENTS.md File

Mission: Craft a prompt so powerful and precise that the AI coding agent can produce an AGENTS.md instruction set rivaling a team of veteran engineers.  The generated instructions must make the agent an unparalleled expert on the repository—capable of delivering top‑quality code, anticipating pitfalls, and obeying every nuance of the codebase.  The instructions must be derived solely from the repository’s contents; never invent or rely on external information unless it is corroborated by multiple references within the code.

Stage 1 – Exhaustive Repository Analysis

Your first duty is to deeply explore the repository.  Leave no stone unturned.  Use built‑in tools to read every file and extract factual information; never make assumptions.

Documentation sweep:  Read all high‑level docs (README.md, CONTRIBUTING.md, design docs, ADRs, RFCs) and note goals, constraints, and terminology.  Scrutinize /docs or /design folders, architecture diagrams, API specs, and any markdown notes.  Summarize how components interact.
Version & environment detection:  Parse config files (e.g., package.json, requirements.txt, pom.xml, .csproj, pyproject.toml, Gemfile, Cargo.toml, Dockerfile, .nvmrc) to determine exact versions of languages, frameworks, libraries, compilers, and tools.  Record build profiles, environment targets, and platform requirements.
Codebase map:  Walk the entire directory tree.  For each top‑level folder and key subfolder:
Identify its purpose (e.g., src/ vs server/ vs client/ vs packages/).
List important modules, classes, functions, and interfaces.  Capture naming conventions, folder naming patterns, and file types.
Note cross‑dependencies and how shared utilities are organized.
In monorepos, delineate subprojects and their relationships.

Build & execution commands:  Locate scripts (scripts/, Makefile, package.json scripts, Gradle tasks, dotnet targets).  Extract commands to install dependencies, run dev servers, build for production, run migrations, and prepare test data.  Determine CI/CD workflows (GitHub Actions, Azure Pipelines) and note each step’s purpose.
Test strategy:  Identify test frameworks (Jest, Vitest, JUnit, pytest, xUnit, etc.) and directories (tests/, __tests__, *.spec.*).  Extract coverage requirements, mocking strategies, naming conventions, and how tests integrate with CI.  List commands for running unit tests, integration tests, e2e tests, and linting.
Coding patterns & standards:  Derive style rules from linting configs (.eslintrc, .stylelintrc, .prettierrc, flake8.cfg, .editorconfig, detekt, ktlint).  Identify patterns in comments, docstrings, and code structure.  Note error‑handling conventions, logging formats, concurrency patterns, dependency injection techniques, and design patterns (MVC, DDD, hexagonal).  Capture naming practices (camelCase, snake_case) and directory names.
Domain knowledge extraction:  Read domain models, database schema files (SQL, Prisma, Entity Framework migrations), API schema definitions (OpenAPI/Swagger, GraphQL).  Summarize data entities, relationships, and API endpoints.  Note domain‑specific terminology and acronyms from code comments or model definitions.
Security & compliance rules:  Identify environment files and secret management patterns (.env, config/secrets.yml, Azure Key Vault).  Note prohibited operations (e.g., destructive database migrations) and safe coding requirements (input validation, sanitization, encryption, parameterized queries).  Capture constraints from security configs (CSP headers, OAuth scopes).
Performance & reliability considerations:  Locate performance‑critical modules (e.g., caching layers, database queries, heavy computational routines).  Note concurrency models, rate limits, and timeouts.  Identify fallback strategies for failures and error escalation paths.
Change history & TODOs:  Scan commit messages, CHANGELOG.md, and inline comments for TODO, FIXME, HACK, DEPRECATED markers.  Extract context about incomplete work, planned refactors, or known issues.  Use this to warn the agent of unstable areas.

Record all findings in your own notes; do not yet write the final AGENTS.md.  Cross‑reference information across multiple files to verify it.  If contradictory patterns exist, document both and mark the preferred one based on frequency and recentness.  Never pull information from the internet unless identical patterns appear in multiple code locations.

Stage 2 – Author the AGENTS.md Instruction Set

After completing the analysis, create a meticulously structured AGENTS.md.  The document must be concise yet exhaustive.  Use the following blueprint, adapting it to your repository.  All sections should be backed by evidence from the codebase.  Include relative links to files and line numbers where helpful.

1 – Project Overview

Mission & Audience:  One‑sentence description of what the project does and who uses it, using terminology from docs.  Include high‑level business or domain context.
Architecture Summary:  Summarize system architecture (e.g., microservices vs monolith, client‑server layers).  Mention major components, databases, APIs, and external integrations.
Technology Stack:  List languages, frameworks, and key libraries with exact versions.  Break down by backend, frontend, testing, tooling, and any polyglot modules.

2 – Environment & Setup

Prerequisite Tools:  Enumerate required software and versions (interpreters, compilers, Docker, cloud CLIs).  Provide installation commands or reference scripts.
Local Setup Steps:  Provide a sequence of commands to bootstrap the project: cloning, installing dependencies, setting environment variables, running initial migrations or seeds, and starting dev servers.  Use platform‑specific alternatives if necessary (e.g., Windows vs Unix).
Environment Variables & Secrets:  List required variables and their purpose.  Indicate where to define them (e.g., .env.local), how to load them, and never include actual secret values.

3 – Development Workflow

Daily Commands:  Document commands for running the application in dev mode for each subproject.  Provide separate scripts for watch/reload, linting, formatting, and static analysis.
Branching & Commit Guidelines:  Specify branch naming conventions (feature/bugfix/hotfix), semantic commit messages, and when to create pull requests.  Mention pre‑commit hooks if configured.
Feature Guidelines:  Explain how to add new components or services: where to place files, how to register modules or routes, patterns to follow for dependency injection, and requirements for accompanying tests and documentation.

4 – Testing & Quality Assurance

Test Types & Locations:  List unit, integration, e2e tests and their directories.  Specify frameworks and any test runners.  Explain how to seed or tear down test data.
Running Tests:  Provide commands to run all tests or subsets (e.g., npm test, pytest, dotnet test).  Explain how to run tests in watch mode and how to view coverage reports.
Quality Gates:  State code coverage thresholds, static analysis tools (linters, type checkers), and what must pass before merging.  Mention CI workflows that enforce these checks.

5 – Coding Standards

Formatting Rules:  Summarize indentation, line length, semicolon usage, quoting style, trailing commas, and file headers derived from linting configs.
Naming Conventions:  Clarify naming patterns for files, classes, functions, variables, constants, and test names.  Include naming rules for database schemas and API endpoints if relevant.
Design Patterns & Architecture:  Describe architectural constraints (e.g., controller layer must remain thin, use repository pattern for data access, state management guidelines).  Mention any domain‑driven boundaries or microservice protocols.
Documentation & Comments:  Indicate preferred comment style (JSDoc, XML docs, Python docstrings) and comment placement.  Specify when to write docstrings, inline comments, or ADRs.

6 – Build & Deployment

Build Steps:  Detail commands to compile, transpile, bundle, or containerize the application for staging and production.  Note any build flags or environment variables.  Include instructions for multi‑project builds in monorepos.
Deployment Processes:  Explain how to deploy to various environments (local Docker, staging, production), including deployment scripts, infrastructure configuration, and manual steps.  Mention release versioning scheme and how to tag releases.

7 – Resources & Tools

Scripts & Utilities:  List helper scripts and what they do (setup, database migration, codegen, performance benchmarking).  Provide usage examples.
External Services:  Summarize integrations (APIs, message brokers, caching layers, cloud providers).  Include connection configuration guidance, referencing config files.
MCP Servers & Extensions:  Note any registered Model Context Protocol servers or extensions used to augment the agent’s capabilities (e.g., GitHub MCP, Playwright MCP) and explain what tasks they enable.

8 – Security & Compliance

Access Control:  Define what operations the AI agent may perform autonomously (refactors, test updates) and what requires human approval (schema migrations, destructive data changes).  Provide clear boundaries.
Secret Handling:  Explain how to manage secrets, including secure storage, retrieval, and injection into the environment.  Warn against committing any credentials.
Sensitive Data Rules:  State policies for personally identifiable information, encryption standards, and compliance obligations (GDPR, HIPAA).  Note any relevant data classification schemes.

9 – Performance & Reliability

Critical Path:  Identify performance‑sensitive modules and best practices for optimizing them.  Provide guidelines for caching, memoization, batch processing, concurrency, and avoiding common bottlenecks.
Error Handling & Recovery:  Describe patterns for logging, error propagation, retries, circuit breakers, and fallback mechanisms.  Provide escalation instructions for unhandled exceptions.

10 – Known Issues & TODOs

Unfinished Work:  Summarize outstanding TODOs, FIXMEs, and known bugs gleaned from the code.  Provide links to relevant issue tracker IDs or comments.
Workarounds:  Document temporary hacks and recommended strategies for dealing with them until the underlying issues are resolved.

11 – Maintenance & Contribution Guidelines

Living Document:  Emphasize that AGENTS.md evolves with the codebase.  Instruct contributors to update this file when adding new frameworks, modules, or significant changes.
Update Process:  Define how to propose changes (e.g., open a pull request with rationale, cite supporting code sections) and who reviews and approves updates.
Future Enhancements:  Suggest adding additional sections for domain‑specific details or linking further design docs as the project grows.

Authoring Principles

Evidence‑driven:  Every instruction must be traceable to at least one code or configuration file.  Never invent commands, frameworks, or workflows.  If conflicting patterns exist, prefer the most widely used and newest versions.
Concise & Structured:  Use short sentences, bullet points, and numbered lists.  Avoid narrative fluff; focus on actionable guidance.  Use tables only for concise data.
Repository‑Bound:  Do not fetch information from the internet unless the same information appears in multiple places within the repository.  When referencing external docs, link to locally stored copies or include them in the repository.
Safety & Boundaries:  Clearly delineate what the agent can and cannot do.  Include warnings about destructive operations and require confirmations.
Human‑Grade Quality:  Aim for thoroughness and precision that would impress a team of senior engineers.  The instruction set should empower the agent to deliver maintainable, idiomatic, and secure code on the first attempt.

Final Step

Once you have written the AGENTS.md according to this blueprint, save it at the repository root.  If your project is a monorepo, consider adding additional AGENTS.md files in subprojects for context‑specific instructions.  Run your own test tasks to validate that the instructions work as written and refine them as necessary.