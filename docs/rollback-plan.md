# iLoveTimers release rollback plan

This plan is for an owner-approved deployment of the current uncommitted release candidate. The repository evidence identifies Netlify as the hosting integration (`netlify.toml` and `@netlify/vite-plugin-react-router`), but the production branch, DNS ownership, deploy permissions, and current production deploy ID are not recorded locally.

## Before deployment

1. Finish the repository release gate and preserve the release candidate in Git only after owner review and explicit commit approval. Record the commit SHA, branch, `package-lock.json` state, Node/npm versions, and the successful Netlify deploy ID.
2. In Netlify, record the currently published deploy ID and its Git revision before publishing the candidate. Confirm that the custom domain and HTTPS certificate are healthy.
3. Export or screenshot the relevant hosting environment-variable names and values through the account's secure controls. Do not copy secrets into this repository or release report.
4. Keep advertising disabled. A future AdSense, consent-platform, DNS, Search Console, or analytics-account change is a separate external change and must have its own change record.

## Restore the previous production revision

Prefer Netlify's recoverable deploy rollback: open the site's deploy history, select the previously recorded healthy production deploy, review its revision and timestamp, and publish that deploy. This restores the prior immutable deployment without rewriting Git history or discarding the current worktree.

If the hosting account requires a Git-based redeploy instead, create a new owner-approved revert commit for the release commit on the deployment branch and deploy that new revision. Do not use `git reset --hard`, force-push, or clean the shared worktree.

## Verify the rollback

Run the critical subset of `docs/post-deployment-smoke-tests.json`: homepage, robots, XML sitemap, one indexable tool, one noindex utility, a direct redirect, privacy, 404, asset loading, console, advertising-disabled state, analytics-before-consent, and `/ads.txt`. Confirm the production response or Netlify deploy metadata identifies the restored deploy ID and revision. Check that caches no longer serve mixed assets from the failed revision.

Browser localStorage is not rolled back by a site deploy. Existing themes, analytics choices, saved tool state, and named presets remain in each browser profile unless a later version explicitly migrates or clears them. The current release does not introduce a destructive storage migration.

## External changes outside Git

Netlify environment variables, custom-domain/DNS configuration, AdSense site state, `ads.txt` account authorization, analytics project settings, consent-platform configuration, and Search Console state are not restored by a Git or Netlify code rollback. Reverse those changes in their owning account using the separate pre-change record.

Live advertising can be disabled independently by removing or disabling the future advertising environment/mode configuration and republishing a verified build. The current code has no live ad mode or Google ad script, so the safe baseline is the current placeholder-only homepage.

To reverse a future `ads.txt` change, restore the last owner-confirmed `public/ads.txt` record and redeploy, then verify the root response and AdSense status. To reverse future consent changes, disable the affected ad/analytics integration first, restore the prior consent configuration in its platform, and verify that no request is made before the required choice. Do not replace a real account value with a fabricated placeholder.
