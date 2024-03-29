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

type Matcher = {
  match(filename: string): boolean
  owners: string[]
}

const createMatcher = (rule: Rule): Matcher => {
  let pattern = rule.pattern
  if (pattern.startsWith('**')) {
    pattern = `/${pattern}`
  } else if (!pattern.startsWith('/')) {
    pattern = `/**/${pattern}`
  }
  if (pattern.endsWith('/')) {
    pattern = `${pattern}**`
  }
  const m = new Minimatch(pattern, {
    dot: true,
    nobrace: true,
    nocomment: true,
    noext: true,
    nonegate: true,
  })
  return {
    match: (filename: string) => {
      if (!filename.startsWith('/')) {
        filename = '/' + filename
      }
      return m.match(filename)
    },
    owners: rule.owners,
  }
}

export class RuleSet {
  private readonly matchers: Matcher[]

  constructor(rules: Rule[]) {
    this.matchers = rules
      .map((rule) => createMatcher(rule))
      // We need to find one in reverse order. The last mentioned code owner is valid.
      // https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax
      .reverse()
  }

  findOwners(filename: string): string[] {
    for (const matcher of this.matchers) {
      if (matcher.match(filename)) {
        return matcher.owners
      }
    }
    return []
  }
}
