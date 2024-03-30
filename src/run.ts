import { RuleSet, parse } from './codeowners.js'
import * as core from '@actions/core'
import * as fs from 'fs/promises'
import { glob } from 'glob'

type Inputs = {
  codeowners: string
  paths: string[]
  errorNoOwner: boolean
}

type Outputs = {
  owners: string[]
  teamOwners: string[]
  teamOwnersWithoutOrganization: string[]
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const ruleSet = await readCodeowners(inputs.codeowners)
  const paths = await expandPaths(inputs.paths)

  const owners = [
    ...new Set(
      paths.flatMap((path) => {
        const owners = ruleSet.findOwners(path)
        if (owners.length > 0) {
          core.info(`Path ${path} has owners: ${owners.join(' ')}`)
        } else {
          core.info(`Path ${path} does not have any owner`)
          if (inputs.errorNoOwner) {
            throw new Error(`No ownership of ${path}. Need to add a rule to ${inputs.codeowners}`)
          }
        }
        return owners
      }),
    ),
  ]
  return formatOutputs(owners)
}

const readCodeowners = async (path: string) => {
  core.info(`Reading ${path}`)
  const content = await fs.readFile(path)
  const rules = parse(content.toString())
  return new RuleSet(rules)
}

const expandPaths = async (paths: string[]) => {
  const ignorePaths: string[] = []
  const globPaths: string[] = []
  const rawPaths: string[] = []
  for (const path of paths) {
    if (path.startsWith('!')) {
      ignorePaths.push(path)
    } else if (path.includes('*')) {
      globPaths.push(path)
    } else {
      rawPaths.push(path)
    }
  }
  const expandedPaths = await glob(globPaths, {
    ignore: ignorePaths,
    dot: true,
  })
  return [...new Set([...rawPaths, ...expandedPaths])]
}

export const formatOutputs = (owners: string[]): Outputs => {
  const teams = findTeams(owners)
  return {
    owners: owners,
    teamOwners: teams,
    teamOwnersWithoutOrganization: formatTeamsWithoutOrganization(teams),
  }
}

const findTeams = (owners: string[]): string[] => owners.filter((owner) => owner.match(/^@.+\/.+/))

const formatTeamsWithoutOrganization = (teams: string[]) => teams.map((team) => team.replace(/^@.+\/(.+)/, '@$1'))
