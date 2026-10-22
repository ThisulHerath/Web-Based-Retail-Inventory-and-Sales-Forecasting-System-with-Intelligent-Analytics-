# Continuous integration

The `CI` GitHub Actions workflow runs on pull requests, pushes to `main`, merge-queue events, and manual dispatch. There is no deployment job and no repository secret is required.

## Checks

- **Frontend tests and build:** Node.js 24, `npm ci`, frontend validation tests, and the Vite production build. Downloads are available as the `frontend-dist` artifact for seven days.
- **Backend tests and coverage:** Node.js 24, `npm ci`, syntax checks for tracked backend JavaScript, and the Jest suite with coverage. The `backend-coverage` artifact is retained for seven days, including when tests fail and a report is available. Tests use local mocks rather than a live Supabase database or email service.
- **Python AI syntax:** Python 3.12 compiles `backend/ai_server.py`. This does not execute the model, install AI runtime dependencies, or test forecast accuracy.
- **CI status:** a single stable check that fails unless all three jobs pass. Failed and skipped jobs are not treated as success.

Jobs run independently, have time limits, use read-only repository permissions, and pin action dependencies to verified commit hashes. npm caches are keyed by each application's committed lockfile. Superseded runs for the same pull request or ref are cancelled.

## Enable

1. Commit and push the workflow to GitHub. The next push to `main` or pull request runs it automatically.
2. In the repository's branch ruleset, require **CI status** before merging into `main`. This workflow does not change repository settings itself.
3. Open **Actions → CI** to inspect logs or download build and coverage artifacts. **Run workflow** starts a manual check once the workflow is on the default branch.

## Run locally

```sh
npm ci --prefix frontend
npm test --prefix frontend
npm run build --prefix frontend
npm ci --prefix backend
npm test --prefix backend -- --ci --coverage
python -m py_compile backend/ai_server.py
```

Backend coverage reflects the existing mocked route/validation suite. It is not an end-to-end test of the live database, email delivery, or deployed application. No production credentials should be added to make these checks pass.

Action references: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [setup-python](https://github.com/actions/setup-python), [upload-artifact](https://github.com/actions/upload-artifact).
