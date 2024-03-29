import { formatOutputs } from '../src/run.js'

describe('formatOutputs', () => {
  it('should format an empty owners', () => {
    const outputs = formatOutputs([])
    expect(outputs).toStrictEqual({
      firstOwner: '',
      owners: [],
      teamOwners: [],
      teamOwnersWithoutOrganization: [],
    })
  })

  it('should format the owners', () => {
    const outputs = formatOutputs(['@global-owner1', '@octo-org/octocats', 'docs@example.com'])
    expect(outputs).toStrictEqual({
      firstOwner: '@global-owner1',
      owners: ['@global-owner1', '@octo-org/octocats', 'docs@example.com'],
      teamOwners: ['@octo-org/octocats'],
      teamOwnersWithoutOrganization: ['@octocats'],
    })
  })
})
