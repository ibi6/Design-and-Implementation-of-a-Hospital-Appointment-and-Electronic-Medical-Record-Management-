# Contributing

Thanks for your interest in improving this project.

## Local development

1. Start backend (`JDK 21`, Maven)
2. Start frontend (`Node 18+`)
3. Use demo accounts in README

## Pull requests

- Keep changes focused and small
- Do not commit secrets (`.env`, private keys, personal academic materials)
- Run backend tests when touching API logic:

```bash
cd backend && mvn test
```

## Code style

- Backend: standard Spring Boot layering (`controller` / `service` / `mapper`)
- Frontend: TypeScript + existing component patterns under `src/components`

## Security

Never commit production JWT secrets or database passwords.  
Use environment variables from `.env.example`.
