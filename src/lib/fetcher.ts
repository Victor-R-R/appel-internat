/**
 * SWR fetcher function
 * Handles JSON responses and errors automatically
 */
export async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url)

  // Handle non-OK responses
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    ;(error as any).status = res.status
    throw error
  }

  const data = await res.json()

  // Handle API error responses
  if (!data.success) {
    const error = new Error(data.error || 'API error')
    ;(error as any).data = data
    throw error
  }

  return data
}
