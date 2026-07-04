// Database utility functions


export const generateId = (slug: string) => `${slug}_${crypto.randomUUID().split('-').join("").slice(slug.length)}`
