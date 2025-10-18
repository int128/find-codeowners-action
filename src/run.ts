import * as fs from 'node:fs/promises'
import * as core from '@actions/core'
import { glob } from 'glob'
import { createMatcher } from './codeowners.js'

type Inputs = {
  codeowners: string
  paths: string[]
  pathGlob: boolean
}

type Outputs = OwnersOutputs & {
  orphanFiles: string[]
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  const codeownersMatcher = createMatcher(await fs.readFile(inputs.codeowners, 'utf8'))
  const files = inputs.pathGlob ? await expandPaths(inputs.paths) : inputs.paths

  const orphanFiles: string[] = []
  const owners = [
    ...new Set(
      files.flatMap((file) => {
        const owners = codeownersMatcher.findOwners(file)
        if (owners.length > 0) {
          core.info(`File ${file} is owned by ${owners.join(' ')}`)
        } else {
          core.warning(`File ${file} is not owned by anyone`)
          orphanFiles.push(file)
        }
        return owners
      }),
    ),
  ]
  core.info(`Owners: ${owners.join(' ')}`)
  return {
    ...formatOwners(owners),
    orphanFiles,
  }
}

const expandPaths = async (paths: string[]) => {
  const ignorePaths = paths.filter((path) => path.startsWith('!'))
  const globPaths = paths.filter((path) => !path.startsWith('!'))
  return await glob(globPaths, {
    ignore: ignorePaths,
    dot: true,
  })
}

type OwnersOutputs = {
  owners: string[]
  ownersWithoutOrganization: string[]
}

export const formatOwners = (owners: string[]): OwnersOutputs => {
  return {
    owners: owners,
    ownersWithoutOrganization: trimOrganization(owners),
  }
}

const trimOrganization = (owners: string[]) => owners.map((team) => team.replace(/^@.+\/(.+)/, '@$1'))
