import {
  convertWildcardToRegex,
} from './convertWildcardToRegex';
import {
  escapeRegexString,
} from './escapeRegexString';
import {
  parseRegex,
} from './parseRegex';
import type {
  HydratedAst,
} from './types';

type RegExpCache = Record<string, RegExp>;

const createRegexTest = (regexCache: RegExpCache, regex: string) => {
  let rule: RegExp;

  if (regexCache[regex]) {
    rule = regexCache[regex];
  } else {
    rule = regexCache[regex] = parseRegex(regex);
  }

  return (subject: string): string | false => {
    return subject.match(rule)?.[0] ?? false;
  };
};

export const createStringTest = (regexCache: RegExpCache, ast: HydratedAst) => {
  if (ast.type !== 'Tag') {
    throw new Error('Expected a tag expression.');
  }

  const {
    expression,
  } = ast;

  if (expression.type === 'RangeExpression') {
    throw new Error('Unexpected range expression.');
  }

  if (expression.type === 'RegexExpression') {
    return createRegexTest(regexCache, expression.value);
  }

  const value = String(expression.value);

  if (value.includes('*') && expression.quoted === false) {
    return createRegexTest(regexCache, String(convertWildcardToRegex(value)) + (expression.quoted ? 'u' : 'ui'));
  } else {
    return createRegexTest(regexCache, '/(' + escapeRegexString(value) + ')/' + (expression.quoted ? 'u' : 'ui'));
  }
};
