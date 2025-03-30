# RestKit

RestKit is a TypeScript toolkit designed to simplify and enhance your API integration process. It provides a comprehensive set of tools for defining, querying, and managing RESTful APIs with complete type safety.

## Overview

RestKit takes a resource-centric approach to REST APIs, allowing you to:
- Model your API resources and their attributes with type validation
- Define relationships between resources to create a navigable resource graph
- Query and manipulate your API resources with full TypeScript type safety
- Reduce boilerplate code in your API integration layer

## Installation

<!-- TODO - Add installation instructions -->

```bash
TODO
```

## Packages

### Core (`@restkit/core`)
The foundation of RestKit, providing the basic building blocks:
- Resource definition with typed attributes
- Relationship modeling (one-to-one, one-to-many)
- Type-safe resource graph construction

#### Defining Resources

```ts
import { resource, attr } from '@restkit/core';

// Define a user resource
const userResource = resource('user', {
  id: attr.number(),
  name: attr.string(),
  email: attr.string().format('email'),
  role: attr.enum(['admin', 'user', 'guest']),
  createdAt: attr.date(),
  updatedAt: attr.date()
});

// Define a post resource
const postResource = resource('post', {
  id: attr.number(),
  title: attr.string(),
  content: attr.string(),
  published: attr.boolean(),
  createdAt: attr.date(),
  updatedAt: attr.date()
});

// Define a comment resource
const commentResource = resource('comment', {
  id: attr.number(),
  content: attr.string(),
  createdAt: attr.date(),
  updatedAt: attr.date()
});
```

#### Creating Relationship Graphs

```ts
import { createRelationGraph, combineResources } from '@restkit/core';

// Combine resources into a single schema
const resources = combineResources(userResource, postResource, commentResource);

// Define relationships between resources
const graph = createRelationGraph(
  resources,
  (r) => ({
    user: [
      r.many.post.as('posts'),          // One user has many posts
      r.one.profile.as('profile')        // One user has one profile
    ],
    post: [
      r.belongsTo.user.as('author'),     // Post belongs to a user
      r.many.comment.as('comments')      // Post has many comments
    ],
    comment: [
      r.belongsTo.user.as('author'),     // Comment belongs to a user
      r.belongsTo.post.as('post')        // Comment belongs to a post
    ]
  })
);
```

## Contributing

We welcome contributions to RestKit! Please see our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

RestKit is released under the MIT License.
