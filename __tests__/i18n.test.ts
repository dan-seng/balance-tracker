import { am } from '../src/i18n/am';
import { getLocale, isLanguage, setLanguage, t } from '../src/i18n';
import { parseMoney, money, prepareSale } from '../src/utils/shopUtils';
const fs = require('fs');
const path = require('path');
declare const __dirname: string;
import ts from 'typescript';

afterEach(() => setLanguage('en'));

test('switches UI copy, interpolates Amharic errors, and keeps user values intact', () => {
  setLanguage('am');
  expect(t('Settings')).toBe('ቅንብሮች');
  expect(getLocale()).toBe('am-ET');
  expect(t('Delete {name}', { name: 'My shop {name}' })).toBe(
    'My shop {name}ን ሰርዝ',
  );
  expect(() => parseMoney('abc')).toThrow(
    am['Enter an ETB amount with up to two decimal places.'],
  );
  expect(money(15050)).toContain('ብር');
  expect(() => prepareSale([], [])).toThrow(
    am['Add at least one product to the sale.'],
  );
  setLanguage('en');
  expect(t('Settings')).toBe('Settings');
  expect(t('{minutes} min', { minutes: 15 })).toBe('15 min');
  expect(getLocale()).toBe('en-ET');
  expect(isLanguage('fr')).toBe(false);
});

test('every explicit translation key has Amharic copy and preserves interpolation tokens', () => {
  const root = path.resolve(__dirname, '..');
  const files: string[] = [path.join(root, 'App.tsx')];
  function collect(dir: string) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) collect(full);
      else if (/\.tsx?$/.test(item.name)) files.push(full);
    }
  }
  collect(path.join(root, 'src'));
  const missing = new Set<string>();
  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    function walk(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(source) === 't' &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const key = node.arguments[0].text;
        if (!(key in am)) missing.add(key);
      }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
  expect([...missing]).toEqual([]);
  for (const [key, value] of Object.entries(am)) {
    expect(value).toMatch(/[\u1200-\u137f]/);
    expect((value.match(/\{\w+\}/g) || []).sort()).toEqual(
      (key.match(/\{\w+\}/g) || []).sort(),
    );
  }
});
