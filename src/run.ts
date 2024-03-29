import * as core from '@actions/core'
import { RuleSet, parse } from './codeowners.js'
import * as fs from 'fs/promises'

type Inputs = {
  codeowners: string
  findByPath: string
}

type Outputs = {
  firstOwner: string
  owners: string[]
  teamOwners: string[]
  teamOwnersWithoutOrganization: string[]
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  core.info(`Reading ${inputs.codeowners}`)
  const content = (await fs.readFile(inputs.codeowners)).toString()
  const rules = parse(content)
  core.startGroup(`Parsed ${inputs.codeowners}`)
  core.info(JSON.stringify(rules, undefined, 2))
  core.endGroup()
  const ruleSet = new RuleSet(rules)

  const owners = ruleSet.findOwners(inputs.findByPath)
  core.info(`Owners = ${JSON.stringify(owners, undefined, 2)}`)
  return formatOutputs(owners)
}

export const formatOutputs = (owners: string[]): Outputs => {
  const teams = findTeams(owners)
  return {
    firstOwner: firstOrEmpty(owners),
    owners: owners,
    teamOwners: teams,
    teamOwnersWithoutOrganization: formatTeamsWithoutOrganization(teams),
  }
}

const firstOrEmpty = (a: string[]): string => (a.length > 0 ? a[0] : '')

const findTeams = (owners: string[]): string[] => owners.filter((owner) => owner.match(/^@.+\/.+/))

const formatTeamsWithoutOrganization = (teams: string[]) => teams.map((team) => team.replace(/^@.+\/(.+)/, '@$1'))
