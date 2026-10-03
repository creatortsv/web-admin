import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import {
  attributeNamed,
  callsOfIdentifier,
  collect,
  hasAsConstString,
  identifiersNamed,
  jsxElementsWithTag,
  parseRepositoryFile,
  readRepositoryFile,
  textOf,
} from './support/sourceAst';

/**
 * The bots and users pages used to flip rendered data locally (status, role) and to alert a success
 * without any backend call. No `adminApi` method exists for those operations, so the controls are
 * rendered as unavailable and no local mutation code remains.
 * [Policy Ref: Contract §2.1 - no fake success; FLP FL-14/FL-16 - an administrative action is never
 * reported done without the backend; TFT INV-14 - divergence/stop actions are never simulated]
 */
interface PageCase {
  readonly name: string;
  readonly path: string;
  readonly constant: string;
  /** State setters whose only legal use is `.then(setX)` (the backend response). */
  readonly setters: readonly string[];
  /** Handlers that mutated the rendered rows locally. */
  readonly removedHandlers: readonly string[];
  /** Texts of the controls that must be disabled. */
  readonly controls: readonly string[];
}

const pages: readonly PageCase[] = [
  {
    name: 'bots',
    path: 'src/app/bots/page.tsx',
    constant: 'BOT_COMMANDS_UNAVAILABLE',
    setters: ['setBots'],
    removedHandlers: ['handleAction'],
    controls: ['Soft Stop', 'Hard Cancel'],
  },
  {
    name: 'users',
    path: 'src/app/users/page.tsx',
    constant: 'USER_MODERATION_UNAVAILABLE',
    setters: ['setUsers'],
    removedHandlers: ['handleStatusChange', 'handleRoleChange'],
    controls: ['Suspend', 'Reactivate', 'Ban'],
  },
];

describe.each(pages)('$name page reports no action the backend did not confirm', (page) => {
  const sourceFile = parseRepositoryFile(page.path);

  it('never calls a state setter outside of the backend response', () => {
    for (const setter of page.setters) {
      expect(callsOfIdentifier(sourceFile, setter).length).toBe(0);
    }
  });

  it('has no local mutation handler', () => {
    for (const handler of page.removedHandlers) {
      expect(identifiersNamed(sourceFile, handler).length).toBe(0);
    }
  });

  it('opens no browser dialog (alert, confirm, prompt) that stands for a result', () => {
    for (const dialog of ['alert', 'confirm', 'prompt']) {
      expect(callsOfIdentifier(sourceFile, dialog).length).toBe(0);
    }
  });

  it('contains no success text that the backend did not send', () => {
    expect(readRepositoryFile(page.path)).not.toMatch(/received command/i);
  });

  it('declares the unavailability text once as an `as const` constant and renders it', () => {
    expect(hasAsConstString(sourceFile, page.constant)).toBe(true);
    const inJsx = identifiersNamed(sourceFile, page.constant).filter((identifier) => {
      let parent: ts.Node | undefined = identifier.parent;
      while (parent !== undefined) {
        if (ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent) || ts.isJsxExpression(parent)) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
    });
    expect(inJsx.length).toBeGreaterThan(0);
  });

  it('renders every action control disabled and without a click handler', () => {
    const buttons = jsxElementsWithTag(sourceFile, 'Button');
    for (const label of page.controls) {
      const matching = buttons.filter((button) => textOf(button) === label);
      expect(matching.length, `Button "${label}"`).toBeGreaterThan(0);
      for (const button of matching) {
        expect(attributeNamed(button, 'disabled'), `Button "${label}" disabled`).toBeDefined();
        expect(attributeNamed(button, 'onClick'), `Button "${label}" onClick`).toBeUndefined();
      }
    }
  });

  it('keeps no raw <button> with an action handler besides the exchange filter', () => {
    const rawButtons = jsxElementsWithTag(sourceFile, 'button').filter(
      (button) => attributeNamed(button, 'onClick') !== undefined,
    );
    const handlers = rawButtons.map((button) => attributeNamed(button, 'onClick')?.initializer?.getText() ?? '');
    for (const handler of handlers) {
      expect(handler).toMatch(/setSelectedExchange/);
    }
  });

  it('wraps the controls in the pkg-ui Tooltip carrying the constant', () => {
    expect(jsxElementsWithTag(sourceFile, 'Tooltip').length).toBeGreaterThan(0);
    const contents = jsxElementsWithTag(sourceFile, 'TooltipContent');
    expect(contents.length).toBeGreaterThan(0);
    for (const content of contents) {
      const references = collect(content, (node): node is ts.Identifier => ts.isIdentifier(node) && node.text === page.constant);
      expect(references.length).toBe(1);
    }
  });
});

describe('users page role selector', () => {
  const sourceFile = parseRepositoryFile('src/app/users/page.tsx');

  it('is disabled and has no change handler', () => {
    const selects = jsxElementsWithTag(sourceFile, 'select');
    expect(selects.length).toBeGreaterThan(0);
    for (const select of selects) {
      expect(attributeNamed(select, 'disabled')).toBeDefined();
      expect(attributeNamed(select, 'onChange')).toBeUndefined();
    }
  });
});
