# Key Management Guidelines

- Store the `AUTH_TOKEN` and `CONVERSATION_ENCRYPTION_KEY` in environment variables.
- Rotate keys regularly and whenever compromise is suspected.
- Never commit keys to source control. Use secret managers or deployment environment configs.
- Limit access to keys to only the services that require them.
