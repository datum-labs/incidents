import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a kebab-case name from a string suitable for Kubernetes resource names.
 */
export function toResourceName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63); // Kubernetes name length limit
}

/**
 * Format a timestamp string for display.
 */
export function formatTimestamp(timestamp: string | undefined): string {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

/**
 * Format a timestamp as a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(timestamp: string | undefined): string {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
}

/**
 * Get the initials from a user ID or name.
 */
export function getInitials(userIdOrName: string): string {
  const parts = userIdOrName.split(/[\s@_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return userIdOrName.slice(0, 2).toUpperCase();
}
