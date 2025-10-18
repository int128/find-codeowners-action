import { describe, expect, it } from 'vitest'
import { formatOwners } from '../src/run.js'

describe('formatOwners', () => {
  it('should format an empty owners', () => {
    const outputs = formatOwners([])
    expect(outputs).toStrictEqual<ReturnType<typeof formatOwners>>({
      owners: [],
      ownersWithoutOrganization: [],
    })
  })

  it('should format the owners', () => {
    const outputs = formatOwners(['@global-owner1', '@octo-org/octocats', 'docs@example.com'])
    expect(outputs).toStrictEqual<ReturnType<typeof formatOwners>>({
      owners: ['@global-owner1', '@octo-org/octocats', 'docs@example.com'],
      ownersWithoutOrganization: ['@global-owner1', '@octocats', 'docs@example.com'],
    })
  })
})
