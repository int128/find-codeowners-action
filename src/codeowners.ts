import { Minimatch } from 'minimatch'

export type Rule = {
  pattern: string
  owners: string[]
}

// Parse the CODEOWNERS and return the records in order.
export const parse = (content: string): Rule[] => {
  const rules: Rule[] = []
  const lines = content.split(/[\r\n]+/)
  for (const line of lines) {
    const owners = line
      .replace(/#.+$/, '')
      .split(/\s+/)
      .filter((s) => s !== '')
    const pattern = owners.shift()
    if (!pattern) {
      continue
    }
    rules.push({ pattern, owners })
  }
  return rules
}

type RuleMatcher = {
  match(filename: string): boolean
  owners: string[]
}

const compile = (rule: Rule): RuleMatcher => {
  const matchers = transformPatternForMinimatch(rule.pattern).map(
    (pattern) =>
      new Minimatch(pattern, {
        dot: true,
        nobrace: true,
        nocomment: true,
        noext: true,
        nonegate: true,
      }),
  )
  return {
    match: (filename: string) => {
      // Ensure the leading slash for matching.
      if (!filename.startsWith('/')) {
        filename = `/${filename}`
      }
      return matchers.some((matcher) => matcher.match(filename))
    },
    owners: rule.owners,
  }
}

const transformPatternForMinimatch = (pattern: string): string[] => {
  // Ensure the leading slash.
  if (pattern.startsWith('**')) {
    pattern = `/${pattern}`
  } else if (!pattern.startsWith('/')) {
    pattern = `/**/${pattern}`
  }

  if (pattern.endsWith('/')) {
    return [`${pattern}**`]
  } else if (pattern.endsWith('*')) {
    return [pattern]
  } else {
    // A pattern without a trailing slash should match both the file and the directory.
    return [pattern, `${pattern}/**`]
  }
}

export class Matcher {
  private readonly ruleMatchers: RuleMatcher[]

  constructor(rules: Rule[]) {
    this.ruleMatchers = rules
      .map((rule) => compile(rule))
      // We need to find one in reverse order. The last mentioned code owner is valid.
      // https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax
      .reverse()
  }

  findOwners(filename: string): string[] {
    for (const ruleMatcher of this.ruleMatchers) {
      if (ruleMatcher.match(filename)) {
        return ruleMatcher.owners
      }
    }
    return []
  }
}

export const createMatcher = (codeownersContent: string): Matcher => new Matcher(parse(codeownersContent))
