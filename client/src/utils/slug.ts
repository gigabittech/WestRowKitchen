// Comprehensive slug utility functions
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

export function normalizeForMatching(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove all special characters
    .replace(/\s+/g, ' ')         // Normalize spaces
    .trim();
}

export function slugMatches(slug: string, name: string): boolean {
  const normalizedSlug = slug.replace(/-/g, ' ').toLowerCase();
  const normalizedName = normalizeForMatching(name);
  return normalizedSlug === normalizedName;
}