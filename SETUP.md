# Stablecoin Payment Modal - Monorepo Setup Guide

This guide walks you through setting up, developing, and deploying the stablecoin payment modal monorepo.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Development](#development)
5. [Publishing](#publishing)
6. [CI/CD Setup](#cicd-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js:** 18.x or higher
- **pnpm:** 9.x or higher (required for workspace support)
- **honker:** Add the honker bun package to run all apps as local VPS processes with access to the same local `main-storage.db` SQLite file,
with sync to turso cloud

### Verification

```bash
node --version    # Should be v18.0.0 or higher
pnpm --version    # Should be 9.0.0 or higher
```

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Or using your system package manager:

```bash
# macOS with Homebrew
brew install pnpm

# Ubuntu/Debian
sudo apt-get install pnpm

# Windows with Choco
choco install pnpm
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stablecoin-payment-modal
cd stablecoin-payment-modal
```

### 2. Install Dependencies

```bash
pnpm install
```

This will:
- Install root dependencies
- Install dependencies for all packages (npm, registry, demo)
- Set up workspace symlinks
- Create pnpm-lock.yaml

### 3. Verify Installation

```bash
pnpm --version
ls packages/npm/node_modules      # npm package dependencies
ls packages/registry/node_modules # registry dependencies
ls packages/demo/node_modules     # demo dependencies
```

## Project Structure

### Directory Layout

```
stablecoin-payment-modal/
├── packages/
│   ├── npm/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── StablecoinPaymentModal.tsx
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── index.ts (barrel export)
│   │   ├── dist/ (generated)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── README.md
│   │
│   ├── registry/
│   │   ├── registry/
│   │   │   └── default/
│   │   │       └── stablecoin-payment-modal.json
│   │   ├── src/
│   │   │   └── stablecoin-payment-modal.tsx
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── demo/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.ts
│
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .npmrc
├── .gitignore
├── package.json
└── README.md
```

### Workspace Configuration

- **pnpm-workspace.yaml:** Defines `packages/*` as workspace packages
- **tsconfig.base.json:** Shared TypeScript configuration
- **.npmrc:** pnpm-specific settings for hoisting and peer dependencies
- **package.json:** Root workspace manifest with shared scripts

## Development

### Starting the Demo App

```bash
pnpm dev
```

This starts Next.js dev server at http://localhost:3000

The demo showcases:
- NPM package integration
- shadcn/ui integration
- Component features
- Installation instructions

### Building Packages

#### Build All Packages

```bash
pnpm build
```

#### Build Specific Package

```bash
pnpm build:npm
pnpm build:registry
```

### Output Structure

After building:

```
packages/npm/dist/
├── index.mjs          # ES Module export
├── index.cjs          # CommonJS export
└── index.d.ts         # TypeScript declarations
```

### Working with Packages

#### Using Local Packages in Demo

The demo app has the npm package as a dependency:

```json
{
  "dependencies": {
    "@stablecoin/payment-modal": "workspace:*"
  }
}
```

This uses the local workspace version. After making changes:

```bash
pnpm build:npm
pnpm dev  # Demo will use the rebuilt package
```

#### Modifying Components

1. **NPM Package:** Edit `packages/npm/src/components/StablecoinPaymentModal.tsx`
2. **Registry:** Edit `packages/registry/src/stablecoin-payment-modal.tsx`

Both implementations should stay in sync for feature parity.

### Linting

```bash
pnpm lint
```

## Publishing

### Prerequisites

1. NPM account ([npmjs.com](https://www.npmjs.com))
2. Authenticated with npm: `npm login`

### Publishing to npm

#### 1. Update Version

```bash
# Option A: Manual update
# Edit packages/npm/package.json
# Change "version": "1.0.0" to "1.0.1"

# Option B: Using npm version
cd packages/npm
npm version patch  # or minor, major
cd ../..
```

#### 2. Build Package

```bash
pnpm build:npm
```

#### 3. Test Build

```bash
cd packages/npm
npm pack  # Creates a tarball to test locally
cd ../..
```

#### 4. Publish to npm

```bash
pnpm publish:npm
```

Or manually:

```bash
cd packages/npm
npm publish --access public
cd ../..
```

#### 5. Verify Publication

```bash
npm view @stablecoin/payment-modal
```

Should show your new version.

### Publishing the Registry

The registry is published to npm as `@stablecoin/registry`:

```bash
pnpm publish:registry
```

Users then install the component via:

```bash
npx shadcn@latest add stablecoin-payment-modal
```

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - run: npm publish
        working-directory: packages/npm
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### GitHub Secrets

Add these to your repository settings:

- `NPM_TOKEN` - Your npm authentication token

Generate token at: https://www.npmjs.com/settings/~/tokens

## Troubleshooting

### Issue: `pnpm install` fails

**Solution:** Clear pnpm cache and retry

```bash
pnpm store prune
pnpm install
```

### Issue: Module not found in demo app

**Solution:** Rebuild the npm package

```bash
pnpm build:npm
# Then restart dev server
pnpm dev
```

### Issue: TypeScript errors in demo app

**Solution:** Check tsconfig paths are correct

```bash
# Verify tsconfig.json extends base
cat packages/demo/tsconfig.json
```

### Issue: Peer dependency warnings

**Solution:** This is normal with `strict-peer-dependencies=false`. If you want stricter checking:

```bash
# Edit .npmrc
strict-peer-dependencies=true
pnpm install
```

### Issue: Port 3000 already in use

**Solution:** Use a different port

```bash
pnpm dev -- -p 3001
```

### Issue: `dist` folder not generating

**Solution:** Check tsup configuration

```bash
# Manual build with verbose output
pnpm build:npm -- --verbose
```

## Common Tasks

### Adding a New Dependency

Add to npm package:

```bash
pnpm add -C packages/npm react@latest
```

Add to demo:

```bash
pnpm add -C packages/demo next@latest
```

### Removing a Package

```bash
pnpm remove -C packages/npm @radix-ui/react-dialog
```

### Updating All Dependencies

```bash
pnpm up --recursive
```

### Clean Build

```bash
pnpm clean
pnpm install
pnpm build
```

## Environment Variables

Create `.env.local` files as needed:

### Demo App (packages/demo/.env.local)

```env
# Optional: Analytics tokens
NEXT_PUBLIC_ANALYTICS_ID=your-id
```

## Resources

- [pnpm Workspace Docs](https://pnpm.io/workspaces)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [shadcn/ui Registry](https://github.com/shadcn-ui/ui)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues:

1. Check [Troubleshooting](#troubleshooting)
2. Review package READMEs
3. Open an issue on GitHub

---

Happy publishing! 🚀
