# Contributing to Bee-Keeper

Thank you for your interest in contributing to Bee-Keeper! This document provides guidelines for contributing to this IBM Bob hackathon project.

## 🎯 Project Philosophy

Bee-Keeper is optimized for:
- **Hackathon Speed**: Rapid iteration and demo reliability
- **Enterprise Quality**: Production-grade code and documentation
- **IBM Bob Integration**: Seamless MCP protocol compliance
- **Operational Focus**: Real-world mainframe forensics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for MCP server and orchestration)
- npm 9+ (for dependency management)
- IBM Bob IDE (for MCP integration testing)
- Git (for version control)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/bee-keeper.git
cd bee-keeper

# Install dependencies
npm install

# Install War Room dependencies
cd war-room && npm install && cd ..

# Run tests
npm test

# Start MCP server in dev mode
npm run dev
```

## 📁 Project Structure

```
/bee-keeper
├── /src/tools/          # Forensic tool implementations
├── /orchestrate/        # Multi-agent orchestration
├── /war-room/           # React visualization dashboard
├── /.bob/               # Bob configuration and knowledge
└── /docs/               # Documentation and screenshots
```

## 🛠️ Development Guidelines

### Code Style

- **Clean and Minimal**: Prefer simplicity over complexity
- **Enterprise Tone**: Professional, operational language
- **Mermaid Diagrams**: Use for architecture and workflows
- **JSDoc Comments**: Document public APIs

### Naming Conventions

- **Files**: `kebab-case.js` (e.g., `jcl-parser.js`)
- **Functions**: `camelCase` (e.g., `parseJCL()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_CONFIDENCE`)
- **Classes**: `PascalCase` (e.g., `ABENDTracer`)

### Error Handling

```javascript
try {
  // Tool logic
  return { status: 'SUCCESS', data: result };
} catch (error) {
  return { 
    status: 'ERROR', 
    message: error.message,
    context: relevantContext 
  };
}
```

### Testing

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test tool workflows
- **Demo Tests**: Verify hackathon demo scenarios

```bash
# Run specific test
npm run test:jcl

# Run all tests
npm test
```

## 🔧 Adding New Tools

### 1. Create Tool Implementation

```javascript
// src/tools/my-new-tool.js
export function myNewTool(args) {
  // Validate inputs
  if (!args.required_param) {
    throw new Error('required_param is required');
  }
  
  // Execute logic
  const result = performAnalysis(args);
  
  // Return structured response
  return {
    status: 'SUCCESS',
    data: result,
    insights: ['Key finding 1', 'Key finding 2'],
    recommendations: ['Action 1', 'Action 2']
  };
}
```

### 2. Register with MCP Server

```javascript
// src/mcp-server/index.js
{
  name: 'my_new_tool',
  description: 'Clear, concise description',
  inputSchema: {
    type: 'object',
    properties: {
      required_param: {
        type: 'string',
        description: 'Parameter description'
      }
    },
    required: ['required_param']
  },
  handler: async (args) => {
    const result = myNewTool(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
}
```

### 3. Add Test Script

```javascript
// test-my-new-tool.js
import { myNewTool } from './src/tools/my-new-tool.js';

const result = myNewTool({ required_param: 'test' });
console.log(JSON.stringify(result, null, 2));
```

### 4. Update Documentation

- Add tool description to README.md
- Update AGENTS.md with behavior guidelines
- Add usage examples

## 📊 Adding Orchestration Agents

### 1. Create Agent Module

```javascript
// orchestrate/agents/my-agent.js
export function myAgent(input) {
  // Agent logic
  return {
    status: 'SUCCESS',
    output: processedData,
    metadata: { executionTime: '0.5s' }
  };
}
```

### 2. Integrate with Workflow

```javascript
// orchestrate/orchestrate-demo.js
import { myAgent } from './agents/my-agent.js';

// Add to workflow
const agentResult = myAgent(previousPhaseOutput);
```

## 🎨 War Room Enhancements

### Adding New Scenarios

```javascript
// war-room/src/data/scenarios.js
export const scenarios = {
  my_scenario: {
    id: 'my_scenario',
    name: 'Scenario Name',
    metadata: { /* incident details */ },
    rootCause: { /* analysis */ },
    enterpriseImpact: [ /* systems */ ],
    recommendations: [ /* actions */ ],
    workflow: [ /* phases */ ],
    mermaidDiagram: `graph TB...`
  }
};
```

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow dark theme color palette
- Maintain responsive design (mobile, tablet, desktop)
- Optimize for 1080p recording

## 📝 Documentation Standards

### README Updates

- Keep sections concise and scannable
- Use Mermaid diagrams for architecture
- Include code examples
- Maintain enterprise tone

### Code Comments

```javascript
/**
 * Parse JCL file and extract topology
 * @param {string} filePath - Path to JCL file
 * @returns {Object} Structured topology with steps, datasets, and issues
 */
export function parseJCL(filePath) {
  // Implementation
}
```

### Commit Messages

```
feat: add S0C4 memory access ABEND support
fix: correct confidence scoring calculation
docs: update architecture diagram
test: add integration test for RCA workflow
```

## 🐛 Bug Reports

### Issue Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node.js version: 18.x
- OS: Windows/Mac/Linux
- Bob version: x.x.x
```

## 🚀 Pull Request Process

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/my-feature`
3. **Make changes** following guidelines above
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m "feat: add my feature"`
6. **Push to fork**: `git push origin feature/my-feature`
7. **Open Pull Request** with clear description

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No breaking changes (or documented)

## 🎯 Hackathon Priorities

### High Priority
- Demo reliability (no crashes during presentation)
- Fast execution (< 2s for workflows)
- Clear visualization (Mermaid diagrams, War Room)
- Enterprise presentation quality

### Medium Priority
- Code optimization
- Additional test coverage
- Documentation improvements

### Low Priority
- Refactoring (unless improves demo)
- Advanced features (Phase 2+)

## 📞 Contact

- **Project Lead**: [Your Name]
- **Hackathon Team**: [Team Name]
- **Slack Channel**: #bee-keeper
- **Email**: bee-keeper@example.com

## 📄 License

MIT License - See LICENSE file for details

---

**Remember**: This is a hackathon project. Prioritize demo quality and speed over perfection. Ship fast, iterate quickly, and maintain enterprise professionalism.

🐝 **Happy Contributing!**

// Made with Bob