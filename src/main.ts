import * as core from '@actions/core'
import { run } from './run.js'

const main = async (): Promise<void> => {
  const outputs = await run({
    codeowners: core.getInput('codeowners', { required: true }),
    paths: core.getMultilineInput('path', { required: true }),
    pathGlob: core.getBooleanInput('path-glob'),
  })
  core.setOutput('owners', outputs.owners.join(' '))
  core.setOutput('team-owners', outputs.teamOwners.join(' '))
  core.setOutput('team-owners-without-organization', outputs.teamOwnersWithoutOrganization.join(' '))
  core.setOutput('no-owner-files', outputs.noOwnerFiles.join('\n'))
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
