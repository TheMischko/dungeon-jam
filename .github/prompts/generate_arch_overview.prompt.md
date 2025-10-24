---
mode: agent
---

# Generate Architecture Instructions

You WILL create a comprehensive architecture.instructions.md file in the .github/instructions/ directory that provides a precise overview of the project architecture tailored for AI Agent use.

## Research Phase

You MUST research and analyze the project structure using available tools:

1. **Analyze main entry point**: You WILL examine the main application file (main.ts, index.js, app.js, etc.) to understand the bootstrap process and core architecture patterns
2. **Study package.json**: You WILL identify the technology stack, frameworks, dependencies, and project type
3. **Examine module structure**: You WILL analyze the src/ directory to understand component organization and architectural patterns
4. **Review configuration files**: You WILL check for architecture-specific configs (nest-cli.json, docker files, etc.)
5. **Identify architectural patterns**: You WILL look for evidence of:
   - Microservice vs monolithic architecture
   - State management patterns
   - Communication protocols (REST, GraphQL, MQTT, WebSocket)
   - Database patterns (Repository, ORM, etc.)
   - Dependency injection frameworks
   - Event-driven architecture

## Content Generation Requirements

You MUST generate an architecture.instructions.md file with these sections:

### Header Format
You WILL start the file with proper VS Code Copilot YAML frontmatter (tailored to the project file types). For example:
```yaml
---
applyTo: "**/*.{ts,js,json,html,scss}"
---
```

### Required Sections

#### 1. Architecture Overview
You WILL provide:
- High-level architectural style (microservice, monolithic, serverless, etc.)
- Core technology stack with versions
- Main architectural patterns identified
- Communication protocols and data flow
- Deployment and runtime characteristics

#### 2. Component Architecture
You WILL document:
- Primary modules/components and their responsibilities
- Directory structure and organization principles
- Dependency relationships between components
- Key interfaces and abstractions
- Service boundaries and separation of concerns

#### 3. Data Architecture
You WILL describe:
- Database technologies and connection patterns
- Data models and schema organization
- Caching strategies if present
- Data persistence patterns (Repository, DAO, etc.)
- Transaction management approach

#### 4. Communication Architecture
You WILL detail:
- API patterns (REST, GraphQL, RPC, Message-based)
- Protocol specifications and data formats
- Authentication and authorization patterns
- Error handling and response structures
- Integration patterns with external services

#### 5. Development Patterns
You WILL outline:
- Code organization principles
- Dependency injection patterns
- Configuration management approach
- Error handling strategies
- Logging and monitoring integration points

#### 6. Key Architectural Decisions
You WILL document:
- Framework and library choices with rationale
- Design pattern implementations
- Performance and scalability considerations
- Security architecture elements
- Testing strategy integration

## Quality Standards

You MUST ensure the documentation:
- **Uses imperative language**: Clear "You WILL" statements for AI Agent instructions
- **Provides concrete examples**: Include actual file paths and code patterns found in the repository
- **Focuses on architecture**: Avoids implementation details while highlighting structural decisions
- **Maintains consistency**: Uses consistent terminology and structure throughout
- **Enables AI understanding**: Written for AI Agent comprehension rather than human documentation

## Implementation Steps

1. **Create directory structure**: You WILL ensure .github/instructions/ directory exists
2. **Generate the file**: You WILL create architecture.instructions.md with proper formatting
3. **Research integration**: You WILL incorporate findings from your analysis into specific, actionable instructions
4. **Validate completeness**: You WILL ensure all required sections are populated with relevant content
5. **Apply formatting standards**: You WILL use proper Markdown formatting with consistent headers and structure

## Success Criteria

The generated architecture.instructions.md file MUST:
- Start with proper VS Code Copilot YAML frontmatter
- Contain all six required sections with substantive content
- Reflect the actual architecture patterns found in the repository
- Provide clear guidance for AI Agents working with the codebase
- Use imperative language throughout
- Include specific examples from the analyzed codebase
- Be self-contained and comprehensive for architectural understanding