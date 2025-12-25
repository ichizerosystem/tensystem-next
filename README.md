# tensystem-next

Next.js project configured with Tailwind CSS, TypeScript, and ESLint.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## CI/CD

This project uses GitHub Actions for CI/CD. The workflow runs on push and pull request events to `main` branch.
It runs:
- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`

## Documentation

See the `docs/` directory for more information.
