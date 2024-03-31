import { formatOwners } from '../src/run.js'

describe('formatOwners', () => {
  it('should format an empty owners', () => {
    const outputs = formatOwners([])
    expect(outputs).toStrictEqual({
      owners: [],
      teamOwners: [],
      teamOwnersWithoutOrganization: [],
    })
  })

  it('should format the owners', () => {
    const outputs = formatOwners(['@global-owner1', '@octo-org/octocats', 'docs@example.com'])
    expect(outputs).toStrictEqual({
      owners: ['@global-owner1', '@octo-org/octocats', 'docs@example.com'],
      teamOwners: ['@octo-org/octocats'],
      teamOwnersWithoutOrganization: ['@octocats'],
    })
  })
})
