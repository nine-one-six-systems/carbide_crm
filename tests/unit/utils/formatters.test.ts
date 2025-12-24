import { describe, it, expect } from 'vitest';

import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn - class name merger', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const shouldInclude = false;
      const shouldIncludeTrue = true;
      expect(cn('foo', shouldInclude && 'bar', 'baz')).toBe('foo baz');
      expect(cn('foo', shouldIncludeTrue && 'bar', 'baz')).toBe('foo bar baz');
    });

    it('should handle undefined and null values', () => {
      expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('should handle object notation', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });
  });
});

describe('date formatting', () => {
  it('should format dates correctly', () => {
    // Basic date formatting test
    const date = new Date('2024-01-15');
    expect(date.toISOString().split('T')[0]).toBe('2024-01-15');
  });
});

describe('string utilities', () => {
  it('should handle empty strings', () => {
    expect(''.length).toBe(0);
  });

  it('should trim whitespace', () => {
    expect('  hello  '.trim()).toBe('hello');
  });
});

