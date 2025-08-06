# Technical Diagrams

This directory contains technical diagrams referenced in the [Technical Specification](../TECH_SPEC.md).

## Diagram Types

### Architecture Diagrams
- `system-architecture.png` - Overall system architecture
- `deployment-architecture.png` - Production deployment setup
- `api-flows.png` - API interaction flows

### Database Diagrams  
- `database-schema.png` - Complete database schema
- `data-relationships.png` - Entity relationships

### Process Diagrams
- `user-flows.png` - User interaction flows
- `payment-flow.png` - Payment processing flow
- `auth-flow.png` - Authentication flow

## Creating Diagrams

### Recommended Tools
- **Draw.io** (draw.io) - For system architecture
- **Mermaid** - For code-based diagrams
- **Lucidchart** - For complex workflows
- **DBDiagram** - For database schemas

### Guidelines
- Export as PNG with transparent background
- Use consistent colors and styling
- Include version/date in diagram footer
- Reference diagrams in Tech Spec using relative paths

### Example Reference
```markdown
*Reference: [System Architecture Diagram](diagrams/system-architecture.png)*
```

## Maintenance

- Update diagrams when architecture changes
- Version control all source files (e.g., .drawio files)
- Review diagrams during PR reviews
- Archive outdated diagrams to `archives/` subdirectory