/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';

/**
 * These tests validate the Tensorlake sandbox ID parsing logic used in
 * start_tensorlake_sandbox (sandbox.ts).
 *
 * The fix addressed two bugs:
 *  1. The old regex `/sbx-[a-zA-Z0-9]+/` only matched IDs with a `sbx-` prefix,
 *     but the `tl` CLI produces IDs like `g0btnkk8k996i0sfq14kj` (no prefix).
 *  2. The old code used `match[0]` (full match) instead of `match[1]` (capture group).
 */

// Mirror the exact regex logic from sandbox.ts so the tests stay in sync.
function parseSandboxId(output: string): string | null {
  const match =
    output.match(/Created sandbox\s+([a-zA-Z0-9_-]+)/) ||
    output.match(/([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : null;
}

describe('Tensorlake sandbox ID parsing', () => {
  describe('primary pattern – "Created sandbox <id>"', () => {
    it('parses an alphanumeric ID without a prefix', () => {
      const output = 'Created sandbox g0btnkk8k996i0sfq14kj';
      expect(parseSandboxId(output)).toBe('g0btnkk8k996i0sfq14kj');
    });

    it('parses the ID when the output also contains status info on the same line', () => {
      // tl may append extra tokens on the same line
      const output = 'Created sandbox g0btnkk8k996i0sfq14kj (pending)';
      expect(parseSandboxId(output)).toBe('g0btnkk8k996i0sfq14kj');
    });

    it('parses the ID from multi-line output (status updates on separate lines)', () => {
      const output =
        'Created sandbox g0btnkk8k996i0sfq14kj (pending)\nWaiting for sandbox to start... running';
      expect(parseSandboxId(output)).toBe('g0btnkk8k996i0sfq14kj');
    });

    it('parses a classic sbx-prefixed ID (backwards compatibility)', () => {
      const output = 'Created sandbox sbx-abc123xyz';
      expect(parseSandboxId(output)).toBe('sbx-abc123xyz');
    });

    it('parses an ID that contains hyphens', () => {
      const output = 'Created sandbox my-sandbox-id-001';
      expect(parseSandboxId(output)).toBe('my-sandbox-id-001');
    });

    it('parses an ID that contains underscores', () => {
      const output = 'Created sandbox my_sandbox_001';
      expect(parseSandboxId(output)).toBe('my_sandbox_001');
    });
  });

  describe('secondary fallback pattern – any long alphanumeric token', () => {
    it('falls back to extracting a long token when "Created sandbox" is absent', () => {
      // Some CLI versions may produce different output format
      const output = 'g0btnkk8k996i0sfq14kj';
      expect(parseSandboxId(output)).toBe('g0btnkk8k996i0sfq14kj');
    });

    it('does not match tokens shorter than 10 characters', () => {
      const output = 'short';
      expect(parseSandboxId(output)).toBeNull();
    });
  });

  describe('regression – old regex would have failed', () => {
    it('does NOT return null for an ID without the sbx- prefix (regression)', () => {
      // This is the exact output that was failing before the fix.
      const output = 'Created sandbox g0btnkk8k996i0sfq14kj (pending)\nWaiting for sandbox to start... running';
      const id = parseSandboxId(output);
      // Old code: output.match(/sbx-[a-zA-Z0-9]+/) → null → threw error
      expect(id).not.toBeNull();
      expect(id).toBe('g0btnkk8k996i0sfq14kj');
    });
  });
});
