# find-codeowners-action [![ts](https://github.com/int128/find-codeowners-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/find-codeowners-action/actions/workflows/ts.yaml)

This action finds the owners from CODEOWNERS.

## Getting Started

```yaml
on:
  workflow_run:
    types:
      - completed

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - id: codeowners
        uses: int128/find-codeowners-action@v1
        with:
          codeowners: .github/CODEOWNERS
          find-by-path: ${{ github.event.workflow.path }}
      - run: echo '${{ steps.codeowners.outputs.owner-teams }}'
```

### Inputs

| Name           | Default    | Description             |
| -------------- | ---------- | ----------------------- |
| `codeowners`   | (required) | Filename of CODEOWNERS  |
| `find-by-path` | (required) | Path to find the owners |

### Outputs

- `first-owner`
