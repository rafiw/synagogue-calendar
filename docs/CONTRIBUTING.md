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

[Report a bug →](https://github.com/yourusername/synagogue-calander/issues/new?labels=bug)

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

[Suggest a feature →](https://github.com/yourusername/synagogue-calander/issues/new?labels=enhancement)

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

### 4. 🔀 Submit Code

Ready to code? Great! Follow these steps:

---

## 💻 Development Setup

### 1. Fork the Repository

Click the "Fork" button on GitHub.

### 2. Clone Your Fork

```bash
git clone https://github.com/yourusername/synagogue-calander.git
cd synagogue-calander
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/originalauthor/synagogue-calander.git
```

### 4. Install Dependencies

```bash
yarn install
```

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests

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

### React Components

```typescript
// Good
interface Props {
  name: string;
  age?: number;
}

export const MyComponent: React.FC<Props> = ({ name, age }) => {
  return <Text>{name}</Text>;
};

// Use functional components
// Add prop types
// Use clear naming
```

### File Organization

```
components/
  ComponentName.tsx      # Component
  ComponentName.test.tsx # Tests

utils/
  helperName.ts         # Helper functions
  helperName.test.ts    # Tests
```

---

## 🧪 Testing

### Run Tests

```bash
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage
```

### Writing Tests

- Write tests for new features
- Update tests when fixing bugs
- Aim for high coverage
- Test edge cases

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('default');
  });
});
```

---

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

### Examples

```bash
feat(zmanim): add candle lighting time display

Add candle lighting time calculation for Shabbat and holidays.
Includes user preference for minutes before sunset.

Closes #123
```

```bash
fix(memorial): correct yahrzeit date calculation

Fixed bug where leap year dates were calculated incorrectly.

Fixes #456
```

```bash
docs(readme): update installation instructions

Added troubleshooting section for common issues.
```

### Using Commitlint

The project uses commitlint to enforce commit messages:

```bash
yarn commitlint
```

This runs automatically on commit via Husky.

---

## 🔄 Pull Request Process

### 1. Update Your Branch

Before submitting, sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 2. Test Everything

```bash
yarn lint           # Check code style
yarn format-check   # Check formatting
yarn test           # Run tests
yarn build          # Test build
```

### 3. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Choose your branch
4. Fill in the template

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Screenshots

(if applicable)

## Checklist

- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Translations updated (if needed)
```

### 5. Code Review

- Be patient - reviews take time
- Be open to feedback
- Make requested changes
- Ask questions if unclear

### 6. After Approval

Your PR will be merged! 🎉

---

## 🎯 Good First Issues

Looking for a place to start?

Check issues labeled:

- `good first issue` - Easy for newcomers
- `help wanted` - We need help here
- `documentation` - Docs improvements

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

## 📚 Contribution Ideas

### Easy Contributions

- 🌍 Add translations for your language
- 📝 Fix typos in documentation
- 🎨 Improve UI/UX
- 🐛 Fix small bugs
- ✅ Add more tests

### Medium Contributions

- 🎨 Create new background themes
- 📱 Improve responsive design
- ♿ Enhance accessibility
- 🔧 Add configuration options
- 📊 Improve performance

### Advanced Contributions

- 🆕 Add major features (discuss first!)
- 🏗️ Refactor core systems
- 🔌 Add new integrations
- 🌐 Platform-specific features
- 🔐 Security improvements

---

## 🎨 UI/UX Guidelines

When contributing UI changes:

### Design Principles

- **Simple** - Keep it intuitive
- **Consistent** - Match existing patterns
- **Accessible** - Usable by everyone
- **Responsive** - Works on all screens
- **Cultural** - Respect Jewish traditions

### Visual Consistency

- Follow existing color scheme
- Use NativeWind/Tailwind classes
- Maintain spacing consistency
- Support both LTR and RTL

### Testing UI Changes

Test on:

- Different screen sizes
- Both orientations
- Hebrew and English
- Light and dark backgrounds

---

## 🌍 Internationalization (i18n)

### Key Guidelines

1. **Never hardcode text** - Always use i18n
2. **Use descriptive keys** - `deceased_name` not `dn`
3. **Keep context** - `schedule_add_prayer` not just `add`
4. **Test RTL** - Especially for Hebrew

### Example

```typescript
// ❌ Bad
<Text>Add Prayer</Text>

// ✅ Good
<Text>{t('schedule_add_prayer')}</Text>
```

---

## 🐛 Debugging Tips

### React Native Debugging

```bash
# Open developer menu
# On device: Shake device
# On emulator: Ctrl+M (Windows) or Cmd+D (Mac)

# Enable debug mode
yarn start --reset-cache
```

### Console Logs

```typescript
console.log('Debug info:', variable);
console.warn('Warning:', issue);
console.error('Error:', error);
```

### React DevTools

```bash
# Install
yarn global add react-devtools

# Run
react-devtools
```

---

## 📞 Getting Help

### Questions?

- 💬 Open a [Discussion](https://github.com/yourusername/synagogue-calander/discussions)
- 🐛 For bugs, open an [Issue](https://github.com/yourusername/synagogue-calander/issues)
- 📧 Email the maintainers

### Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Hebcal Documentation](https://www.hebcal.com/home/developer-apis)

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unethical or unprofessional conduct

### Enforcement

Report issues to the project maintainers.

---

## 🏆 Recognition

Contributors will be:

- Listed in GitHub contributors
- Mentioned in release notes
- Added to project credits

Thank you for contributing! 💙

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the GPL-2.0 License.

---

[⬅️ Back to Main README](../README.md)
