# 🤝 Contributing to Synagogue Calendar

Thank you for considering contributing to the Synagogue Calendar project! This document provides guidelines and instructions for contributing.

---

## 🌟 Ways to Contribute

### 1. 🐛 Report Bugs

Found a bug? Please report it!

**Before submitting:**

- Check if the issue already exists
- Make sure you're using the latest version

**When reporting, include:**

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Device/platform information
- App version

[Report a bug →](https://github.com/rafiw/synagogue-calendar/issues/new?labels=bug)

---

### 2. 💡 Suggest Features

Have an idea for improvement?

**Before suggesting:**

- Check if the feature has already been requested
- Consider if it fits the project's scope

**When suggesting:**

- Describe the feature clearly
- Explain the use case
- Describe how it would work
- Add mockups if possible

[Suggest a feature →](https://github.com/rafiw/synagogue-calendar/issues/new?labels=enhancement)

---

### 3. 📝 Improve Documentation

Documentation is always welcome!

**Ideas:**

- Fix typos or unclear explanations
- Add examples
- Translate to more languages
- Create video tutorials
- Write blog posts

---

## 📝 Coding Standards

### Code Style

We use ESLint and Prettier for code formatting.

**Before committing:**

```bash
yarn lint          # Check for issues
yarn lint:fix      # Auto-fix issues
yarn format        # Format with Prettier
```

### TypeScript

- Use TypeScript for all new files
- Avoid `any` types when possible
- Add proper type definitions
- Document complex types

---

## 🧪 Testing

### Run Tests

```bash
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage
```

## 🌍 Adding Translations

We support multiple languages using i18next.

### Add a New Language

1. **Create translation file:**

   ```bash
   # Create locales/es.json (Spanish example)
   ```

2. **Copy from English:**

   ```bash
   cp locales/en.json locales/es.json
   ```

3. **Translate all keys:**

   ```json
   {
     "day": "Día",
     "time": "Hora",
     ...
   }
   ```

4. **Update i18n config** in `utils/i18n.ts`:

   ```typescript
   import es from '../locales/es.json';

   resources: {
     en: { translation: en },
     he: { translation: he },
     es: { translation: es }, // Add here
   }
   ```

5. **Test translations:**
   ```bash
   yarn check-translations
   ```

### Translation Guidelines

- Keep the same key names
- Maintain formatting placeholders: `{{date}}`
- Consider RTL languages (like Hebrew)
- Test in the app
- Check for text overflow

---

## 🔧 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

---

## 🚀 Feature Development Workflow

For larger features:

### 1. Discuss First

Open an issue to discuss:

- What you want to build
- Why it's needed
- How you plan to implement it

### 2. Get Feedback

Wait for maintainer feedback before starting.

### 3. Break It Down

Split large features into smaller PRs:

- Easier to review
- Faster to merge
- Less conflicts

### 4. Document

- Update README if needed
- Add inline code comments
- Update type definitions
- Add examples

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the GPL-2.0 License.

---

[⬅️ Back to Main README](../README.md)
