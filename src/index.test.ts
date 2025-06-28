import { describe, expect, it } from 'vitest'
import { createContext, use, runWithContext } from './context'

describe('AsyncContext', () => {
	it('should run a function with a context value', async () => {
		const handle = createContext<string>('initial')
		const value = 'test'
		const result = await handle.run(value, async () => {
			const context = use(handle)
			return context
		})
		expect(result).toBe(value)
	})
	it('should return the initial value if the context is not set', async () => {
		const handle = createContext<string>('initial')
		const result = use(handle)
		expect(result).toBe('initial')
	})

	it('should handle nested context values', async () => {
		const handle = createContext<string>('initial')

		const result = await handle.run('outer', async () => {
			const outerValue = use(handle)

			const innerResult = await handle.run('inner', async () => {
				const innerValue = use(handle)
				return { outer: outerValue, inner: innerValue }
			})

			const outerValueAfter = use(handle)
			return { ...innerResult, outerAfter: outerValueAfter }
		})

		expect(result).toEqual({
			outer: 'outer',
			inner: 'inner',
			outerAfter: 'outer',
		})
	})

	it('should isolate contexts between parallel operations', async () => {
		const handle = createContext<number>(0)

		const promises = [
			handle.run(1, async () => {
				await new Promise(resolve => setTimeout(resolve, 10))
				return use(handle)
			}),
			handle.run(2, async () => {
				await new Promise(resolve => setTimeout(resolve, 5))
				return use(handle)
			}),
			handle.run(3, async () => {
				return use(handle)
			}),
		]

		const results = await Promise.all(promises)
		expect(results).toEqual([1, 2, 3])
	})

	it('should maintain context across async boundaries', async () => {
		const handle = createContext<string>('initial')

		const result = await handle.run('test', async () => {
			// Test setTimeout
			const timeoutResult = await new Promise<string>(resolve => {
				setTimeout(() => {
					resolve(use(handle))
				}, 1)
			})

			// Test Promise.resolve
			const promiseResult = await Promise.resolve().then(() =>
				use(handle)
			)

			// Test Promise.all
			const allResults = await Promise.all([
				Promise.resolve(use(handle)),
				Promise.resolve(use(handle)),
			])

			return {
				timeout: timeoutResult,
				promise: promiseResult,
				all: allResults,
			}
		})

		expect(result).toEqual({
			timeout: 'test',
			promise: 'test',
			all: ['test', 'test'],
		})
	})

	it('should handle multiple different context handles', async () => {
		const stringHandle = createContext<string>('default-string')
		const numberHandle = createContext<number>(0)
		const objectHandle = createContext<{ name: string }>({
			name: 'default',
		})

		const result = await stringHandle.run('hello', async () => {
			return await numberHandle.run(42, async () => {
				return await objectHandle.run({ name: 'test' }, async () => {
					return {
						string: use(stringHandle),
						number: use(numberHandle),
						object: use(objectHandle),
					}
				})
			})
		})

		expect(result).toEqual({
			string: 'hello',
			number: 42,
			object: { name: 'test' },
		})
	})

	it('should preserve context when errors are thrown', async () => {
		const handle = createContext<string>('initial')

		try {
			await handle.run('error-context', async () => {
				const contextBeforeError = use(handle)
				expect(contextBeforeError).toBe('error-context')
				throw new Error('Test error')
			})
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
			expect((error as Error).message).toBe('Test error')
		}

		// Context should be back to initial after error
		const contextAfterError = use(handle)
		expect(contextAfterError).toBe('initial')
	})

	it('should work with runWithContext utility function', async () => {
		const handle = createContext<string>('initial')
		const runner = runWithContext(handle, 'utility-value')

		const result = await runner(async () => {
			return use(handle)
		})

		expect(result).toBe('utility-value')
	})

	it('should handle deeply nested async operations', async () => {
		const handle = createContext<number>(0)

		const deepAsync = async (depth: number): Promise<number[]> => {
			const current = use(handle)
			if (depth === 0) {
				return [current]
			}

			const nextResults = await handle.run(current + 1, async () => {
				await new Promise(resolve => setTimeout(resolve, 1))
				return deepAsync(depth - 1)
			})

			return [current, ...nextResults]
		}

		const result = await handle.run(1, async () => {
			return deepAsync(3)
		})

		expect(result).toEqual([1, 2, 3, 4])
	})

	it('should handle context with complex data types', async () => {
		interface User {
			id: number
			name: string
			permissions: string[]
		}

		const userHandle = createContext<User>({
			id: 0,
			name: 'anonymous',
			permissions: [],
		})

		const testUser: User = {
			id: 123,
			name: 'John Doe',
			permissions: ['read', 'write'],
		}

		const result = await userHandle.run(testUser, async () => {
			const user = use(userHandle)

			// Simulate some async operation that depends on user context
			const hasWritePermission = await Promise.resolve(
				user.permissions.includes('write')
			)

			return {
				user,
				canWrite: hasWritePermission,
			}
		})

		expect(result).toEqual({
			user: testUser,
			canWrite: true,
		})
	})

	it('should handle concurrent modifications to the same context handle', async () => {
		const handle = createContext<string[]>([])

		const operations = Array.from({ length: 5 }, (_, i) =>
			handle.run([`item-${i}`], async () => {
				await new Promise(resolve =>
					setTimeout(resolve, Math.random() * 10)
				)
				const current = use(handle)
				return current.length
			})
		)

		const results = await Promise.all(operations)

		// Each operation should see its own context value
		expect(results).toEqual([1, 1, 1, 1, 1])
	})
})
