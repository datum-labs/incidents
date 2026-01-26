import { describe, it, expect } from 'vitest';
import { cn, toResourceName, formatRelativeTime, getInitials } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'truthy', false && 'falsy')).toBe('base truthy');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('toResourceName', () => {
  it('converts to lowercase', () => {
    expect(toResourceName('HelloWorld')).toBe('helloworld');
  });

  it('replaces spaces with hyphens', () => {
    expect(toResourceName('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(toResourceName('Hello! World?')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(toResourceName('--hello--')).toBe('hello');
  });

  it('truncates to 63 characters', () => {
    const longName = 'a'.repeat(100);
    expect(toResourceName(longName).length).toBe(63);
  });

  it('handles consecutive special characters', () => {
    expect(toResourceName('Hello!!!World')).toBe('hello-world');
  });
});

describe('formatRelativeTime', () => {
  it('returns "N/A" for undefined', () => {
    expect(formatRelativeTime(undefined)).toBe('N/A');
  });

  it('returns "just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago for recent times', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('returns hours ago for older times', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago for much older times', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });
});

describe('getInitials', () => {
  it('extracts initials from space-separated names', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles email-like strings', () => {
    expect(getInitials('john@example.com')).toBe('JE');
  });

  it('handles underscore-separated names', () => {
    expect(getInitials('john_doe')).toBe('JD');
  });

  it('handles single words', () => {
    expect(getInitials('john')).toBe('JO');
  });

  it('returns uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});
