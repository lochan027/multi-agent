# ADK-TS Architecture Note

## About IQAI ADK-TS

This project implements the **ADK-TS (Agent Development Kit for TypeScript)** architecture pattern, which is designed for building multi-agent systems with the following principles:

### Core Concepts

1. **Agents**: Autonomous entities with specific responsibilities
   - Each agent has a clear, single purpose
   - Agents communicate via event emissions
   - Stateless design for scalability

2. **Tasks**: Structured work units with defined schemas
   - Input validation
   - Output specifications
   - Run logic
   - Type safety

3. **Tools**: Reusable utilities for agents
   - External API integrations
   - Blockchain interactions
   - Data processing

### Implementation in This Project

Since `adk-ts` is not publicly available on npm, this project demonstrates the **ADK-TS architecture pattern** using standard TypeScript:

```typescript
// Agent Pattern
class Agent {
  private tools: Tool[];
  
  async executeTask(input: TaskInput): Promise<TaskOutput> {
    // Use tools to process task
    // Emit events for other agents
  }
  
  onEmitTask(callback: (task) => void) {
    // Register inter-agent communication
  }
}

// Task Pattern
class Task {
  taskName: string;
  validateInput(input: TaskInput): boolean;
  async run(input: TaskInput): Promise<TaskOutput>;
}

// Tool Pattern
class Tool {
  async execute(params: ToolParams): Promise<ToolResult>;
}
```

### Event-Driven Communication

Agents communicate through typed event emissions:

```
ScannerAgent.onEmitRiskTask() 
  → RiskAgent.handleRiskTask()
  
RiskAgent.onEmitExecTask() 
  → ExecutorAgent.handleExecTask()
```

This pattern enables:
- Loose coupling between agents
- Easy testing and mocking
- Horizontal scaling
- Fault isolation

### Adapting to Real ADK-TS

When the actual `adk-ts` package becomes available:

1. Install: `npm install adk-ts`
2. Import agent base classes: `import { Agent, Task, Tool } from 'adk-ts'`
3. Extend base classes instead of creating from scratch
4. Use ATP (Agent Task Protocol) for deployment
5. Leverage built-in monitoring and logging

The architecture is already compatible - you'll just need to:
- Extend `Agent` base class
- Use ADK's task registration system
- Leverage ATP deployment tools

## Why This Architecture?

✅ **Modularity**: Each component is independent and testable
✅ **Scalability**: Agents can run on separate processes/servers
✅ **Maintainability**: Clear separation of concerns
✅ **Type Safety**: Full TypeScript support with strict typing
✅ **Extensibility**: Easy to add new agents, tasks, or tools
✅ **Production-Ready**: Follows enterprise design patterns

## Learn More

- IQAI Documentation: https://docs.iqai.network
- Multi-Agent Systems: https://en.wikipedia.org/wiki/Multi-agent_system
- Event-Driven Architecture: https://aws.amazon.com/event-driven-architecture/
