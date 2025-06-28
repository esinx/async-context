import { AsyncLocalStorage } from 'node:async_hooks'

export interface ContextHandle<Context> {
	use: () => Context
	run: <Result>(value: Context, fn: () => Promise<Result>) => Promise<Result>
}

/**
 * Create a new context handle
 * @returns A context handle
 */
export function createContext<Context>(
	initialValue: Context
): ContextHandle<Context> {
	const storage = new AsyncLocalStorage<Context>()
	storage.enterWith(initialValue)
	return {
		use: () => {
			const value = storage.getStore()
			return value ?? initialValue
		},
		run: async <Result>(value: Context, fn: () => Promise<Result>) => {
			return storage.run(value, fn)
		},
	}
}

/**
 * Get the current context value
 * @param handle - The context handle
 * @returns The current context value
 */
export function use<Context>(handle: ContextHandle<Context>): Context {
	return handle.use()
}

/**
 * Run a function with a context value
 * @param handle - The context handle
 * @param value - The context value
 * @returns A function that runs the provided function with the context value
 */
export function runWithContext<Context>(
	handle: ContextHandle<Context>,
	value: Context
) {
	return async <Result>(fn: () => Promise<Result>): Promise<Result> => {
		return handle.run(value, fn)
	}
}
