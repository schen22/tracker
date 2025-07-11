# tracker

- automatically deploys to broccoli.mom via netlify on any push
- keeps track of my pup stuff, though this could all be easily solved via gform

## deploy steps:

1. Install dependencies: `npm install`
2. Test: `npm start`
3. Build deployment: `npm run build`
4. Commit built files and push: `git push origin main`
5. Navigate to broccoli.mom for changes live

Note: data incoming to persist in private github repo.
All changes tracked with full git history.

## tests

1. `npm test -- --testPathPattern=InsightsService.test.js`

## tradeoffs:

### Pros:

- ez set up / maintenance tho P:
- no setup required
- access from any device, anywhere
- instant sync across devices
- cost effective and easily modifiable
- data stays private/secure + netlify/github's reliable
- can decide to scale later on if i really want to

### Cons:

- this will only be used + modified by me given my private github repo
- doesn't really allow for real time collab or complex queries
- doesn't support multiple users/profiles; but can probs extend
