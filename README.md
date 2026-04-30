# card-shuffle

Demo monorepo for the Mafia card-shuffle game, used to exercise ReARM's
programmatic feature-set switching and PR-blocking flows on the dev
instance at `https://dev.rearmhq.com`.

## Layout

| Path           | Source                                                           | What it is                                |
|----------------|------------------------------------------------------------------|-------------------------------------------|
| `mafia-vue/`     | [taleodor/mafia-vue](https://github.com/taleodor/mafia-vue)      | Vue 3 frontend (Dockerfile + Nginx)       |
| `mafia-express/` | [taleodor/mafia-express](https://github.com/taleodor/mafia-express) | Node/Express backend (Dockerfile)         |
| `mafia-helm/`    | [relizaio/helm-charts](https://github.com/relizaio/helm-charts) `mafia/` | Helm chart wiring the two services + redis |

## CI

`.github/workflows/build.yml` runs on every push and submits build
metadata + SBOMs for all three components to ReARM dev. Container images
are pushed to
`registry.test.relizahub.com/a98e122c-3265-43da-b73d-ce21f49c397a-public`
and the helm chart is OCI-pushed to the same namespace. `create_component`
is on so the components self-provision on first build.

Both `relizaio/rearm-docker-action` and `relizaio/rearm-helm-action` are
pinned to `@main` for the duration of this demo.

## Secrets used

- `DOCKER_LOGIN`, `DOCKER_TOKEN` — registry auth (provisioned on the repo)
- `REARM_API_ID`, `REARM_API_KEY` — FREEFORM key for the dev ReARM org
