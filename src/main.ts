import * as core from '@actions/core'
import { run } from './run.js'

const main = async (): Promise<void> => {
  const outputs = await run({
    codeowners: core.getInput('codeowners', { required: true }),
    findByPath: core.getInput('find-by-path', { required: true }),
  })
  core.setOutput('first-owner', outputs.firstOwner)
  core.setOutput('owners', outputs.owners.join(' '))
  core.setOutput('team-owners', outputs.teamOwners.join(' '))
  core.setOutput('team-owners-without-organization', outputs.teamOwnersWithoutOrganization.join(' '))
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
