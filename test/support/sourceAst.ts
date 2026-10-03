import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const REPOSITORY_ROOT = resolve(__dirname, '..', '..');

export function parseRepositoryFile(relativePath: string): ts.SourceFile {
  const text = readFileSync(resolve(REPOSITORY_ROOT, relativePath), 'utf8');
  return ts.createSourceFile(relativePath, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
}

export function readRepositoryFile(relativePath: string): string {
  return readFileSync(resolve(REPOSITORY_ROOT, relativePath), 'utf8');
}

export function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

export function collect<T extends ts.Node>(root: ts.Node, guard: (node: ts.Node) => node is T): T[] {
  const found: T[] = [];
  walk(root, (node) => {
    if (guard(node)) {
      found.push(node);
    }
  });
  return found;
}

/** Calls of a plain identifier, for example `setBots(...)`; `.then(setBots)` is not a call of it. */
export function callsOfIdentifier(root: ts.Node, name: string): ts.CallExpression[] {
  return collect(
    root,
    (node): node is ts.CallExpression =>
      ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name,
  );
}

/** Calls of `object.method(...)`, for example `adminApi.updateBrokerConfig(...)`. */
export function callsOfMethod(root: ts.Node, objectName: string, method: string): ts.CallExpression[] {
  return collect(
    root,
    (node): node is ts.CallExpression =>
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === objectName &&
      node.expression.name.text === method,
  );
}

export function identifiersNamed(root: ts.Node, name: string): ts.Identifier[] {
  return collect(root, (node): node is ts.Identifier => ts.isIdentifier(node) && node.text === name);
}

export function jsxElementsWithTag(root: ts.Node, tag: string): Array<ts.JsxElement | ts.JsxSelfClosingElement> {
  return collect(
    root,
    (node): node is ts.JsxElement | ts.JsxSelfClosingElement =>
      (ts.isJsxElement(node) && node.openingElement.tagName.getText() === tag) ||
      (ts.isJsxSelfClosingElement(node) && node.tagName.getText() === tag),
  );
}

export function openingOf(element: ts.JsxElement | ts.JsxSelfClosingElement): ts.JsxOpeningLikeElement {
  return ts.isJsxElement(element) ? element.openingElement : element;
}

export function attributeNamed(element: ts.JsxElement | ts.JsxSelfClosingElement, name: string): ts.JsxAttribute | undefined {
  return openingOf(element)
    .attributes.properties.filter(ts.isJsxAttribute)
    .find((attribute) => attribute.name.getText() === name);
}

/** The visible text children of a JSX element, trimmed and joined. */
export function textOf(element: ts.JsxElement | ts.JsxSelfClosingElement): string {
  if (!ts.isJsxElement(element)) {
    return '';
  }
  return collect(element, (node): node is ts.JsxText => ts.isJsxText(node))
    .map((node) => node.text.trim())
    .filter((text) => text !== '')
    .join(' ');
}

/** Whether `const <name> = '<text>' as const;` exists at module level. */
export function hasAsConstString(sourceFile: ts.SourceFile, name: string): boolean {
  return sourceFile.statements.some(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === name &&
          declaration.initializer !== undefined &&
          ts.isAsExpression(declaration.initializer) &&
          ts.isStringLiteralLike(declaration.initializer.expression),
      ),
  );
}
