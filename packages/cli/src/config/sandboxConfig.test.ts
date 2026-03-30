/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('command-exists', () => ({
  default: { sync: vi.fn() },
}));

vi.mock('../utils/package.js', () => ({
  getPackageJson: vi.fn().mockResolvedValue({
    config: { sandboxImageUri: 'ghcr.io/blackbox_ai/blackbox-cli:test' },
  }),
}));

import commandExists from 'command-exists';
import { loadSandboxConfig } from './sandboxConfig.js';
import type { Settings } from './settings.js';

// Helper: empty settings object
const emptySettings: Settings = {} as Settings;

describe('loadSandboxConfig – tensorlake', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear any SANDBOX / GEMINI_SANDBOX env vars before each test
    delete process.env['SANDBOX'];
    delete process.env['GEMINI_SANDBOX'];
    delete process.env['GEMINI_SANDBOX_IMAGE'];
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('returns tensorlake config when GEMINI_SANDBOX=tensorlake and tl is installed', async () => {
    process.env['GEMINI_SANDBOX'] = 'tensorlake';
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, {});

    expect(result).toEqual({ command: 'tensorlake', image: 'tensorlake' });
  });

  it('throws FatalSandboxError when GEMINI_SANDBOX=tensorlake but tl is not installed', async () => {
    process.env['GEMINI_SANDBOX'] = 'tensorlake';
    vi.mocked(commandExists.sync).mockReturnValue(false);

    await expect(loadSandboxConfig(emptySettings, {})).rejects.toThrow(
      /Missing sandbox command 'tl'/,
    );
  });

  it('returns tensorlake config when sandbox=tensorlake is passed via CLI argv', async () => {
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, {
      sandbox: 'tensorlake',
    });

    expect(result).toEqual({ command: 'tensorlake', image: 'tensorlake' });
  });

  it('returns tensorlake config from settings.tools.sandbox when tl is present', async () => {
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const settingsWithTensorlake: Settings = {
      tools: { sandbox: 'tensorlake' },
    } as unknown as Settings;

    const result = await loadSandboxConfig(settingsWithTensorlake, {});

    expect(result).toEqual({ command: 'tensorlake', image: 'tensorlake' });
  });

  it('uses tensorlake image placeholder regardless of GEMINI_SANDBOX_IMAGE', async () => {
    process.env['GEMINI_SANDBOX'] = 'tensorlake';
    process.env['GEMINI_SANDBOX_IMAGE'] = 'my-custom-image:latest';
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, {});

    // Tensorlake always uses 'tensorlake' as the image placeholder
    expect(result).toEqual({ command: 'tensorlake', image: 'tensorlake' });
  });

  it('returns undefined when SANDBOX env var is set (already inside sandbox)', async () => {
    process.env['SANDBOX'] = 'tensorlake-sbx-abc123';
    process.env['GEMINI_SANDBOX'] = 'tensorlake';
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, {});

    // When already inside a sandbox, no sandbox should be started
    expect(result).toBeUndefined();
  });

  it('does not auto-select tensorlake when sandbox=true but tl is not preferred over docker', async () => {
    // docker takes priority over tensorlake in the auto-detection chain
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'docker' || cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, { sandbox: true });

    expect(result?.command).toBe('docker');
  });

  it('auto-selects tensorlake when sandbox=true and only tl is available (no docker/podman)', async () => {
    vi.mocked(commandExists.sync).mockImplementation(
      (cmd: string) => cmd === 'tl',
    );

    const result = await loadSandboxConfig(emptySettings, { sandbox: true });

    expect(result).toEqual({ command: 'tensorlake', image: 'tensorlake' });
  });
});
