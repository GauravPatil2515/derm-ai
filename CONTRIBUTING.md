# Contributing to DermAI

First off, thank you for considering contributing to DermAI! It's people like you that make DermAI such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful** and considerate in your communication
- **Be collaborative** and open to feedback
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- Groq API Key

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:

```bash
git clone https://github.com/YOUR_USERNAME/derm-ai.git
cd derm-ai
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/derm-ai.git
```

4. **Set up the project** (follow [SETUP.md](docs/SETUP.md))

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**Branch naming conventions**:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

**Backend:**

```bash
cd backend
pytest tests/
```

**Frontend:**

```bash
npm test
```

**Integration:**

```bash
npm run test:integration
```

### 4. Commit Your Changes

Follow the commit message guidelines (see below)

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your fork and branch
- Fill out the PR template
- Submit for review

---

## 💻 Coding Standards

### Python (Backend)

**Style Guide**: Follow [PEP 8](https://pep8.org/)

**Tools**:

- **Formatter**: Black
- **Linter**: Flake8
- **Type Checker**: mypy

**Run formatters**:

```bash
cd backend
black .
flake8 .
mypy .
```

**Best Practices**:

- Use type hints for function parameters and return values
- Write docstrings for all functions and classes
- Keep functions small and focused
- Use meaningful variable names
- Handle exceptions appropriately

**Example**:

```python
def analyze_image(image_path: str) -> dict:
    """
    Analyze a skin image using the AI model.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary containing analysis results
        
    Raises:
        FileNotFoundError: If image file doesn't exist
        RuntimeError: If model is not loaded
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

**Style Guide**: Follow [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)

**Tools**:

- **Formatter**: Prettier
- **Linter**: ESLint

**Run formatters**:

```bash
npm run lint
npm run format
```

**Best Practices**:

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and reusable
- Use meaningful component and variable names
- Avoid inline styles (use Tailwind classes)

**Example**:

```typescript
interface AnalysisResultProps {
  result: AnalysisData;
  onClose: () => void;
}

export function AnalysisResult({ result, onClose }: AnalysisResultProps) {
  // Implementation
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid custom CSS unless absolutely necessary
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(analysis): add Grad-CAM visual explanations

Implemented Grad-CAM to show which areas of the skin image
influenced the AI's decision. This improves transparency and
helps users understand the analysis.

Closes #123
```

```
fix(chat): resolve connection timeout issue

Fixed an issue where the chat service would timeout after
30 seconds of inactivity. Increased timeout to 5 minutes
and added reconnection logic.

Fixes #456
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] No merge conflicts

### PR Template

When creating a PR, include:

1. **Description**: What does this PR do?
2. **Motivation**: Why is this change needed?
3. **Testing**: How was this tested?
4. **Screenshots**: If UI changes, include before/after screenshots
5. **Checklist**: Complete the checklist above

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Address feedback** and make requested changes
4. **Approval** from maintainer
5. **Merge** by maintainer

---

## 🧪 Testing

### Writing Tests

**Backend (pytest)**:

```python
def test_analyze_image_success():
    """Test successful image analysis"""
    analyzer = DermatologyAnalyzer()
    result = analyzer.analyze_image("test_image.jpg")
    
    assert result['success'] == True
    assert 'primary_analysis' in result
    assert result['primary_analysis']['confidence'] > 0
```

**Frontend (Jest + React Testing Library)**:

```typescript
describe('AnalysisResult', () => {
  it('displays analysis results correctly', () => {
    const mockResult = { /* ... */ };
    render(<AnalysisResult result={mockResult} />);
    
    expect(screen.getByText(/condition/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
npm test

# Coverage
npm run test:coverage
```

---

## 📚 Documentation

### What to Document

- **New features**: Add to README and relevant docs
- **API changes**: Update API documentation
- **Configuration**: Update .env.example and SETUP.md
- **Breaking changes**: Clearly document in PR and CHANGELOG

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep it up to date

---

## 🎯 Areas for Contribution

### High Priority

- [ ] Add user authentication system
- [ ] Implement unit tests for all components
- [ ] Add E2E tests with Cypress
- [ ] Improve error handling
- [ ] Add API documentation with Swagger

### Medium Priority

- [ ] Implement Redis caching
- [ ] Add Docker support
- [ ] Improve accessibility (WCAG 2.1 AA)
- [ ] Add internationalization (i18n)
- [ ] Performance optimizations

### Low Priority

- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

---

## 💡 Questions?

- **General questions**: Open a [Discussion](https://github.com/OWNER/derm-ai/discussions)
- **Bug reports**: Open an [Issue](https://github.com/OWNER/derm-ai/issues)
- **Feature requests**: Open an [Issue](https://github.com/OWNER/derm-ai/issues) with `enhancement` label
- **Email**: <gauravpatil2516@gmail.com>

---

## 🙏 Thank You

Your contributions make DermAI better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**
