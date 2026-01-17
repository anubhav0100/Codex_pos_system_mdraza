# Point on Sale Web

A modern React frontend for the Point of Sale system, built with Vite, TypeScript, and a robust architecture.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Linting & Formatting
```bash
# Run ESLint
npm run lint

# Fix lint errors
npm run lint:fix

# Format code with Prettier
npm run format
```

## 📂 Project Structure
- `src/app`: Application-wide providers and core logic.
- `src/routes`: Route definitions and navigation.
- `src/screens`: Page components.
- `src/components`: Shared UI components.
- `src/features`: Feature-specific modules.
- `src/services`: API and external service logic.
- `src/store`: State management (e.g., Redux, Zustand).
- `src/hooks`: Custom React hooks.
- `src/theme`: Styling and theme configuration.
- `src/utils`: Helper functions.
- `src/types`: TypeScript definitions.

## 🛠️ Configuration
- **Vite**: Configured with path aliases (`@/` points to `src/`).
- **ESLint**: Integrated with Prettier for code quality and consistency.
- **Environment**: Use `.env.example` as a template for your local `.env`.
