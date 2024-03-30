# find-codeowners-action [![ts](https://github.com/int128/find-codeowners-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/find-codeowners-action/actions/workflows/ts.yaml)

This action finds the owners from [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

## Getting Started

To find the owners of a file,

```yaml
steps:
  - uses: actions/checkout@v4
  - id: codeowners
    uses: int128/find-codeowners-action@v0
    with:
      codeowners: CODEOWNERS
      find-by-path: src/index.ts
```

This action reads `CODEOWNERS` file in the working directory,
and finds the owners of `src/index.ts`.

If no owner is found, this action returns an empty string.

### Notify a workflow run event to the owners

Here is an example to notify an event to the corresponding owners.

```yaml
on:
  workflow_run:
    types:
      - completed

jobs:
  notify-workflow-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: codeowners
        uses: int128/find-codeowners-action@v0
        with:
          codeowners: CODEOWNERS
          find-by-path: ${{ github.event.workflow.path }}
      - uses: slackapi/slack-github-action@v1
        with:
          channel-id: example
          slack-message: |
            Hey ${{ steps.codeowners.outputs.team-owners-without-organization }}, the workflow run is done!
```

### Inputs

| Name           | Default    | Description             |
| -------------- | ---------- | ----------------------- |
| `codeowners`   | (required) | Filename of CODEOWNERS  |
| `find-by-path` | (required) | Path to find the owners |

### Outputs

| Name                               | Description                            |
| ---------------------------------- | -------------------------------------- |
| `owners`                           | Owners                                 |
| `team-owners`                      | Team owners in the form of `@org/team` |
| `team-owners-without-organization` | Team owners in the form of `@team`     |
