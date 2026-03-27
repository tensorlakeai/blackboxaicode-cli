/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Terminal Platform Constants
 *
 * This file contains terminal-related constants used throughout the application,
 * specifically for handling keyboard inputs and terminal protocols.
 */

/**
 * Kitty keyboard protocol sequences for enhanced keyboard input.
 * @see https://sw.kovidgoyal.net/kitty/keyboard-protocol/
 */
export const KITTY_CTRL_C = '[99;5u';

/**
 * Kitty keyboard protocol keycodes
 */
export const KITTY_KEYCODE_ENTER = 13;
export const KITTY_KEYCODE_NUMPAD_ENTER = 57414;
export const KITTY_KEYCODE_TAB = 9;
export const KITTY_KEYCODE_BACKSPACE = 127;

/**
 * Timing constants for terminal interactions
 */
export const CTRL_EXIT_PROMPT_DURATION_MS = 1000;

/**
 * VS Code terminal integration constants
 */
export const VSCODE_SHIFT_ENTER_SEQUENCE = '\\\r\n';

/**
 * Backslash + Enter detection window in milliseconds.
 * Used to detect Shift+Enter pattern where backslash
 * is followed by Enter within this timeframe.
 */
export const BACKSLASH_ENTER_DETECTION_WINDOW_MS = 5;

/**
 * Escape code timeout in milliseconds for readline's keypress emitter.
 *
 * Over a network PTY (e.g. Tensorlake sandbox via WebSocket), escape sequences
 * like arrow keys (ESC[A) can arrive in separate chunks. A timeout of 0 causes
 * readline to emit the ESC immediately as a standalone key, breaking arrow keys
 * and other multi-byte escape sequences. A small nonzero value gives readline
 * enough time to buffer the full sequence without making the ESC key feel laggy.
 */
export const ESC_TIMEOUT_MS = 50;

/**
 * Maximum expected length of a Kitty keyboard protocol sequence.
 * Format: ESC [ <keycode> ; <modifiers> u/~
 * Example: \x1b[13;2u (Shift+Enter) = 8 chars
 * Longest reasonable: \x1b[127;15~ = 11 chars (Del with all modifiers)
 * We use 12 to provide a small buffer.
 */
export const MAX_KITTY_SEQUENCE_LENGTH = 12;

/**
 * Character codes for common escape sequences
 */
export const CHAR_CODE_ESC = 27;
export const CHAR_CODE_LEFT_BRACKET = 91;
export const CHAR_CODE_1 = 49;
export const CHAR_CODE_2 = 50;
