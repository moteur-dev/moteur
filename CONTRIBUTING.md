# Contributing to Moteur

✅ Use feature branches (`feature/*`, `bugfix/*`, `docs/*`).  
✅ All work should be done through Pull Requests (PRs).  
✅ PRs must pass CI (build, lint, and tests green).  

---

## 💻 Code Style & Tooling

✅ This project uses **ESNext TypeScript** as the primary language (ESM modules).  
✅ Linting and formatting are handled by **ESLint** and **Prettier**.  
✅ Husky pre-commit hooks run `npm run lint:fix`, `npm run build`, and `npm run test` automatically.  

---

## 🚀 Setup

> This project uses pnpm to handle packages in a monorepo.
`npm install -g pnpm`

1. Clone the repo:

```bash
git clone git@github.com:moteur-dev/moteur.git
cd moteur
pnpm install
```

2. Install Husky hooks:

```bash
npm run prepare
```
## 🔥 Making Changes

✅ Follow Conventional Commits.
✅ Keep commits small and focused.
✅ For larger changes, open an issue first to discuss!

## 📦 Scripts

Command	Description
`pnpm -r build`		TypeScript build (ESNext, ESM)
`pnpm -r lint:fix`	Lint and auto-fix code
`pnpm -r test`		Run unit tests (Vitest, single-run)

## 🤝 Thank You!

Thanks for helping make Moteur awesome 🚀
