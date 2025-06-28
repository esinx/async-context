# async-context

A TypeScript library for async context management, using React-like context API powered by Node.js AsyncLocalStorage.

## Installation

```bash
npm install async-context
# or
yarn add async-context
# or
pnpm add async-context
```

## What is Async Context?

Async context allows you to maintain contextual information throughout an async call chain without explicitly passing it through every function parameter. This is particularly useful for:

- **Request tracing**: Maintain request IDs across async operations
- **User context**: Keep user information available throughout request handling
- **Logging**: Automatically include contextual information in logs
- **Database transactions**: Maintain transaction context across async operations
- **Feature flags**: Access feature flag state throughout your application

## The Problem

In traditional async JavaScript/TypeScript code, passing context through multiple layers can be cumbersome:

```typescript
// Without async context - tedious parameter passing
async function handleRequest(userId: string, requestId: string) {
	const user = await fetchUser(userId, requestId)
	const data = await processData(user, requestId)
	await saveResult(data, userId, requestId)
}

async function fetchUser(userId: string, requestId: string) {
	console.log(`[${requestId}] Fetching user ${userId}`)
	// ... fetch logic
}

async function processData(user: User, requestId: string) {
	console.log(`[${requestId}] Processing data for ${user.id}`)
	// ... processing logic
}
```

## The Solution

With async context, you can maintain this information implicitly:

```typescript
// With async context - clean and maintainable
const userContext = createContext<User | null>(null)
const requestContext = createContext<string>('')

async function handleRequest(userId: string, requestId: string) {
	await requestContext.run(requestId, async () => {
		const user = await fetchUser(userId)
		await userContext.run(user, async () => {
			const data = await processData()
			await saveResult(data)
		})
	})
}

async function fetchUser(userId: string) {
	const requestId = use(requestContext)
	console.log(`[${requestId}] Fetching user ${userId}`)
	// ... fetch logic
}

async function processData() {
	const user = use(userContext)
	const requestId = use(requestContext)
	console.log(`[${requestId}] Processing data for ${user.id}`)
	// ... processing logic
}
```

## Installation

```bash
npm install async-context
# or
yarn add async-context
# or
pnpm add async-context
```

## Quick Start

```typescript
import { createContext, use } from 'async-context'

// Create a context with a default value
const userContext = createContext<string>('anonymous')

// Run code with a specific context value
await userContext.run('john-doe', async () => {
	// All async operations in this scope have access to the context
	const currentUser = use(userContext) // 'john-doe'

	await someAsyncOperation()

	// Still available after async operations
	const stillCurrentUser = use(userContext) // 'john-doe'
})

// Outside the run scope, back to default
const defaultUser = use(userContext) // 'anonymous'
```

## API Reference

### `createContext<T>(initialValue: T): ContextHandle<T>`

Creates a new context handle with an initial/default value.

```typescript
const stringContext = createContext<string>('default')
const numberContext = createContext<number>(0)
const userContext = createContext<User | null>(null)
```

### `ContextHandle<T>`

The object returned by `createContext` with the following methods:

#### `handle.run<Result>(value: T, fn: () => Promise<Result>): Promise<Result>`

Runs an async function with a specific context value.

```typescript
const result = await handle.run('new-value', async () => {
	// Context is 'new-value' within this scope
	return await someAsyncOperation()
})
```

#### `handle.use(): T`

Gets the current context value (same as the standalone `use` function).

```typescript
const currentValue = handle.use()
```

### `use<T>(handle: ContextHandle<T>): T`

Gets the current value from a context handle.

```typescript
const currentUser = use(userContext)
```

### `runWithContext<T>(handle: ContextHandle<T>, value: T)`

Creates a reusable function that runs operations with a specific context value.

```typescript
const runAsAdmin = runWithContext(userContext, adminUser)

const result = await runAsAdmin(async () => {
	// This runs with adminUser as the context
	return await performAdminOperation()
})
```

## Common Patterns

### Request Tracing

```typescript
import { createContext, use } from 'async-context'

const requestIdContext = createContext<string>('')

// Express middleware
app.use((req, res, next) => {
	const requestId = req.headers['x-request-id'] || generateId()
	requestIdContext.run(requestId, () => {
		next()
	})
})

// In any handler or service
async function processOrder() {
	const requestId = use(requestIdContext)
	logger.info(`Processing order`, { requestId })
	// ... processing logic
}
```

### User Context

```typescript
interface User {
	id: string
	role: string
	permissions: string[]
}

const userContext = createContext<User | null>(null)

// Authentication middleware
async function authenticate(token: string) {
	const user = await verifyToken(token)
	return userContext.run(user, async () => {
		// All subsequent operations have access to user context
		return await handleRequest()
	})
}

// In any service
async function createPost(data: PostData) {
	const currentUser = use(userContext)
	if (!currentUser) {
		throw new Error('Not authenticated')
	}

	if (!currentUser.permissions.includes('create:post')) {
		throw new Error('Insufficient permissions')
	}

	// ... create post logic
}
```

### Database Transactions

```typescript
const transactionContext = createContext<Transaction | null>(null)

async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
	const transaction = await db.beginTransaction()

	try {
		const result = await transactionContext.run(transaction, fn)
		await transaction.commit()
		return result
	} catch (error) {
		await transaction.rollback()
		throw error
	}
}

// Usage
await withTransaction(async () => {
	await createUser(userData)
	await createProfile(profileData)
	// Both operations use the same transaction automatically
})
```

### Nested Contexts

```typescript
const tenantContext = createContext<string>('default')
const userContext = createContext<User | null>(null)

await tenantContext.run('tenant-123', async () => {
	await userContext.run(user, async () => {
		// Both contexts are available
		const tenant = use(tenantContext) // 'tenant-123'
		const currentUser = use(userContext) // user object

		await performOperation()
	})
})
```

## Advanced Usage

### Context Composition

```typescript
interface AppContext {
	user: User | null
	requestId: string
	tenant: string
}

const appContext = createContext<AppContext>({
	user: null,
	requestId: '',
	tenant: 'default',
})

// Helper function to create context
function createAppContext(user: User, requestId: string, tenant: string) {
	return { user, requestId, tenant }
}

await appContext.run(createAppContext(user, requestId, tenant), async () => {
	const { user, requestId, tenant } = use(appContext)
	// ... application logic
})
```

### Context Providers (React-like pattern)

```typescript
class ContextProvider {
	constructor(
		private userContext = createContext<User | null>(null),
		private requestContext = createContext<string>('')
	) {}

	async provideContext<T>(
		user: User,
		requestId: string,
		fn: () => Promise<T>
	): Promise<T> {
		return this.requestContext.run(requestId, async () => {
			return this.userContext.run(user, fn)
		})
	}

	getCurrentUser() {
		return use(this.userContext)
	}

	getCurrentRequestId() {
		return use(this.requestContext)
	}
}
```

## Best Practices

1. **Use meaningful default values**: Choose defaults that make sense for your application
2. **Keep context immutable**: Don't modify context objects; create new ones instead
3. **Avoid context for frequently changing data**: Context is best for relatively stable information
4. **Use TypeScript**: Take advantage of type safety for your context values
5. **Document your contexts**: Make it clear what each context represents and when it's available
6. **Test with context**: Include context scenarios in your tests

## Error Handling

Context is automatically cleaned up when errors occur:

```typescript
try {
	await userContext.run(user, async () => {
		// Context is available here
		throw new Error('Something went wrong')
	})
} catch (error) {
	// Context is back to default/initial value
	const currentUser = use(userContext) // back to initial value
}
```

## Performance Considerations

- AsyncLocalStorage has minimal overhead for most applications
- Context lookup is very fast (O(1))
- Nested contexts have minimal additional cost
- Consider using context composition for complex state rather than many individual contexts

## Requirements

- Node.js 16+ (AsyncLocalStorage support)
- TypeScript 4.5+ (for best type support)

## License

MIT
