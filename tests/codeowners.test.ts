import * as codeowners from '../src/codeowners.js'
import { describe, it, expect } from 'vitest'

describe('class Matcher', () => {
  const matcher = new codeowners.Matcher([
    // From the example of the official docs:
    // https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#example-of-a-codeowners-file
    { pattern: '*.js', owners: ['@js-owner'] },
    { pattern: '/docs/', owners: ['@root-docs-owner'] },
    { pattern: 'docs/*', owners: ['@docs-owner'] },
    { pattern: 'logs/', owners: ['@logs-owner'] },
    { pattern: '/build/logs/', owners: ['@build-owner'] },
  ])

  it.each([
    { filename: 'README.md', owners: [] },
    { filename: 'index.js', owners: ['@js-owner'] },
    { filename: 'src/index.js', owners: ['@js-owner'] },
    { filename: 'docs/index.md', owners: ['@docs-owner'] },
    { filename: 'docs/deep/index.md', owners: ['@root-docs-owner'] },
    { filename: 'component/docs/index.md', owners: ['@docs-owner'] },
    { filename: 'logs/1.log', owners: ['@logs-owner'] },
    { filename: 'component/logs/1.log', owners: ['@logs-owner'] },
    { filename: 'build/logs/1.log', owners: ['@build-owner'] },
  ])('returns $owners corresponding to $filename', ({ filename, owners }) => {
    const found = matcher.findOwners(filename)
    expect(found).toStrictEqual(owners)
  })
})

describe('parse()', () => {
  it('returns an empty if the CODEOWNERS is nothing', () => {
    const rules = codeowners.parse(``)
    expect(rules).toStrictEqual([])
  })

  it('returns the rule', () => {
    const rules = codeowners.parse(`*       @global-owner1 @global-owner2`)
    expect(rules).toStrictEqual([
      {
        pattern: '*',
        owners: ['@global-owner1', '@global-owner2'],
      },
    ])
  })

  it('returns the rules', () => {
    const rules = codeowners.parse(`
# From the example of the official docs:
# https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#example-of-a-codeowners-file
*       @global-owner1 @global-owner2
*.js    @js-owner #This is an inline comment.

/build/logs/ @doctocat

/apps/ @octocat
/apps/github
`)
    expect(rules).toStrictEqual([
      {
        pattern: '*',
        owners: ['@global-owner1', '@global-owner2'],
      },
      {
        pattern: '*.js',
        owners: ['@js-owner'],
      },
      {
        pattern: '/build/logs/',
        owners: ['@doctocat'],
      },
      {
        pattern: '/apps/',
        owners: ['@octocat'],
      },
      {
        pattern: '/apps/github',
        owners: [],
      },
    ])
  })
})
