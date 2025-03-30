# @restkit/core

Core package of RestKit that provides the fundamental building blocks for modeling REST API resources and their relationships. This package serves as the foundation for other RestKit packages, such as `@restkit/query`.

## Overview

@restkit/core provides a type-safe way to:
- Define API resources
- Model relationships between resources
- Create resource graphs
- Handle resource relationships with proper cardinality

## Key Concepts

### Resources

Resources represent your API endpoints and their data structure. Each resource is defined with its attributes and relationships to other resources.

### Relations

Relations define how resources are connected to each other. The package supports:
- One-to-one relationships
- One-to-many relationships
- Type-safe relation paths

### Resource Graph

The core concept that ties everything together is the Resource Graph, which provides:
- A complete view of your API's resource structure
- Type-safe navigation between related resources
- Depth-controlled traversal

## Basic Usage

```typescript
import { createRelationGraph } from '@restkit/core';

// Define your resources
const resources = {
  user: resource('user', {
    name: attr.string(),
    email: attr.string()
  }),
  post: resource('post', {
    title: attr.string(),
    content: attr.string()
  })
};

// Create a relation graph
const graph = createRelationGraph(resources, (referencer) => ({
  user: [
    referencer.many.posts.as('posts')
  ],
  post: [
    referencer.one.user.as('author')
  ]
}));
```

## API Reference

### Resource Definition

```typescript
resource(name: string, attributes: AttributeMap)
```

### Relation Graph Creation

```typescript
createRelationGraph(
  resources: ResourceMap | Resource[],
  relationshipDefinition: (referencer: RelationReferencer) => RelationshipMap
)
```

### Relation Types

```typescript
RelationCardinality.ONE  // One-to-one relationship
RelationCardinality.MANY // One-to-many relationship
```

## Type Safety

The package is built with TypeScript and provides comprehensive type safety for:
- Resource definitions
- Relationship declarations
- Path traversal

## Installation

```bash
npm install @restkit/core
```

## Related Packages

- `@restkit/query` - Build on top of core to handle API queries
