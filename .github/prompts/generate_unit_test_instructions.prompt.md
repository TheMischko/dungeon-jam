---
mode: agent
---

You are an expert AI agent specializing in analyzing codebases and generating comprehensive unit testing instruction files for Visual Studio Code Copilot Agent Mode. Your task is to create an ultimate `.github/instructions/unit_test.instructions.md` file that will serve as the definitive guide for AI coding agents writing unit tests.

## CRITICAL REQUIREMENTS

### 1. VS Code Copilot File Format Compliance
The generated instruction file MUST begin with this EXACT format:
```
---
applyTo: "**/*.spec.ts"
---
```
- Use the detected test file patterns (e.g., "**/*.spec.ts", "**/*.test.js", "**/*_test.go")
- Multiple patterns can be added with additional applyTo lines
- This format is MANDATORY for VS Code Copilot detection

### 2. Comprehensive Test File Analysis
You MUST analyze a significant sample of test files to extract patterns:
- **MANDATORY**: Use `file_search` to discover ALL test files in the repository
- **MANDATORY**: Use `read_file` to analyze UP TO 30 test files (if more exist, prioritize the largest/most complex ones)
- **MANDATORY**: Extract patterns from ACTUAL file contents, not assumptions
- **MANDATORY**: Document which files were analyzed for transparency

## Primary Objectives

1. **Systematically analyze test files** using file_search and read_file tools
2. **Detect test file patterns** and testing frameworks from actual usage
3. **Extract comprehensive testing patterns** from 30+ actual test files including:
   - Mock patterns and setup strategies
   - Assertion styles and test structure
   - Setup/teardown patterns
   - Naming conventions and organization
   - Framework-specific best practices
4. **Generate VS Code Copilot compliant instructions** with proper applyTo format

## MANDATORY Analysis Process

### Step 1: Repository Test Discovery
**YOU MUST EXECUTE THESE COMMANDS:**
1. `file_search` with pattern `**/*.{spec,test}.{ts,js,go,py,rb,java,cpp,cs}` to find ALL test files
2. `read_file` on package.json, go.mod, requirements.txt, pom.xml to identify testing frameworks
3. Count total test files found and plan analysis strategy

### Step 2: Systematic Test File Analysis
**YOU MUST EXECUTE THESE COMMANDS:**
1. `read_file` on UP TO 30 test files (prioritize largest/most complex)
2. If more than 30 test files exist, select a representative sample across different directories/modules
3. Document which specific files were analyzed
4. Extract patterns from ACTUAL file contents, not generic knowledge

### Step 3: Pattern Extraction
For each type of test file found, analyze:

**Framework Detection:**
- Jest, Mocha, Jasmine, Vitest (JavaScript/TypeScript)
- Go testing, Testify (Go)
- pytest, unittest (Python)
- JUnit, TestNG (Java)
- MSTest, xUnit, NUnit (.NET)
- GoogleTest (C++)

**Testing Patterns:**
- Mock creation patterns (jest.mock, jest-mock-extended, sinon, etc.)
- Setup/teardown lifecycle (beforeEach, beforeAll, setup, tearDown)
- Assertion styles (expect().toBe(), assert.Equal(), should(), etc.)
- Test organization (describe blocks, test suites, nested contexts)
- Spy and stub patterns
- Error testing patterns
- Async testing patterns

**Code Quality Patterns:**
- Naming conventions for test files and functions
- Test documentation and comments
- Test data organization
- Mock file organization (__mocks__, test fixtures)
- Coverage expectations and patterns

### Step 3: Instruction File Generation
Create a comprehensive instruction file that includes:

1. **Auto-detected applyTo patterns** based on found test files
2. **Framework-specific sections** for each detected testing framework
3. **Common patterns and best practices** extracted from existing tests
4. **Mock and setup templates** derived from actual usage
5. **Do's and Don'ts** based on code analysis
6. **VS Code Copilot optimization** with specific guidance for agent mode

## MANDATORY Output Format

The generated instruction file MUST use this EXACT structure and format:

```markdown
---
applyTo: "**/*.spec.ts"
---

# Unit Testing Instructions

## Framework Overview
[Detected frameworks and their usage patterns from analyzed files]

## Testing Standards
[Extracted from actual test files - include file citations]

## Mock Patterns  
[Common mock patterns found in analyzed codebase with examples]

## Setup/Teardown Patterns
[Lifecycle patterns from analyzed test files with examples]

## Assertion Styles
[How assertions are written in this specific codebase with examples]

## Best Practices
[Do's and Don'ts derived from actual code analysis]

## VS Code Copilot Optimization
[Specific guidance for AI agent performance]

---
## Analysis Summary
Files analyzed: [List of specific test files that were read and analyzed]
Total test files found: [Number]
Primary framework: [Detected framework]
```

## Success Criteria

✅ **Comprehensive Coverage**: Analyzes ALL test files in repository, not just selected ones
✅ **Framework Agnostic**: Detects and handles multiple testing frameworks
✅ **Pattern Extraction**: Identifies actual patterns used in the codebase
✅ **VS Code Integration**: Optimized specifically for Copilot Agent Mode
✅ **Actionable Instructions**: Provides concrete, usable guidance for AI agents
✅ **Auto-Detection**: Requires no manual input about test types or frameworks

## EXECUTION CHECKLIST

Before generating the instruction file, you MUST complete ALL of these steps:

- [ ] **Execute `file_search` to find ALL test files** in the repository 
- [ ] **Execute `read_file` on package.json** to identify testing frameworks
- [ ] **Execute `read_file` on UP TO 30 test files** (prioritize largest/most representative)
- [ ] **Document which specific files were analyzed** in your response
- [ ] **Extract patterns from ACTUAL file contents** (mock setups, assertions, etc.)
- [ ] **Generate instruction file with proper `applyTo:` format**
- [ ] **Include analysis summary** with file list and framework detection

## CRITICAL SUCCESS CRITERIA

✅ **VS Code Copilot Format**: File begins with `---\napplyTo: "pattern"\n---`
✅ **Comprehensive Analysis**: Analyzed 30+ test files using read_file tool  
✅ **Pattern Extraction**: Identified patterns from ACTUAL code, not generic knowledge
✅ **Framework Detection**: Identified testing framework from package.json and usage
✅ **Documentation**: Listed which specific files were analyzed
✅ **Actionable Instructions**: Concrete examples extracted from analyzed files

## EXECUTION COMMAND

**START NOW**: Execute `file_search` to discover all test files, then systematically analyze them using `read_file` to create the ultimate VS Code Copilot instruction file.