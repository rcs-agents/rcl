# Documentation Setup Guide

This guide explains how the GitHub Pages documentation is configured and how to work with it.

## Architecture

All GitHub Pages files are organized in the `site/` directory to keep them separate from the main project. The documentation is organized into two main sections:

### 📖 How to Use (User Documentation)
- Source: `docs/` directory (committed to repo)
- Build target: `site/_user_docs/` collection (generated during build)
- Covers guides, tutorials, and API reference for users

### 🔧 How it Works (Internal Documentation)  
- Source: `src/*/README.md` files (stays in place, close to code)
- Build target: `site/_internal_docs/` collection (generated during build)
- Covers architecture and contributor information

## Build Process

### Automatic (GitHub Actions)

The documentation automatically builds and deploys when:
- Changes are pushed to `main` branch
- Changes affect documentation files or build scripts
- Manual workflow dispatch

### Manual (Local Development)

```bash
# Install Jekyll (one-time setup)
gem install jekyll bundler
cd site
bundle init
echo 'gem "jekyll", "~> 4.3"' >> Gemfile
echo 'gem "minima", "~> 2.5"' >> Gemfile
echo 'gem "jekyll-feed", "~> 0.12"' >> Gemfile
echo 'gem "jekyll-sitemap", "~> 1.4"' >> Gemfile
echo 'gem "jekyll-seo-tag", "~> 2.8"' >> Gemfile
bundle install
cd ..

# Build documentation
npm run docs:build

# Serve locally (with watch mode)
npm run docs:serve
```

## Scripts

### `scripts/build-docs.js`
Copies documentation files to the Jekyll site directory:
- User docs: `docs/*.md` → `site/_user_docs/*.md`
- Internal docs: `src/*/README.md` → `site/_internal_docs/*.md`

Each file gets Jekyll front matter with title, description, and order.

### `scripts/generate-llms-txt.js`
Generates LLM-friendly documentation files according to [llmstxt.org](https://llmstxt.org):

- **`site/llms.txt`** - Essential project information for LLMs
- **`site/llms-full.txt`** - Complete codebase and documentation

## File Structure

```
├── site/                       # All GitHub Pages files
│   ├── _config.yml            # Jekyll configuration
│   ├── _layouts/              # Page layouts
│   │   ├── default.html       # Main layout with sidebar
│   │   ├── user_doc.html      # User documentation layout
│   │   └── internal_doc.html  # Internal documentation layout
│   ├── _includes/             # Reusable components
│   │   ├── head.html          # HTML head
│   │   ├── header.html        # Site header
│   │   ├── footer.html        # Site footer
│   │   └── sidebar.html       # Navigation sidebar
│   ├── _user_docs/            # User docs (generated from docs/)
│   ├── _internal_docs/        # Internal docs (generated from src/)
│   ├── assets/css/style.scss  # Custom styles
│   ├── index.md               # Homepage
│   ├── llms.txt               # Generated LLM summary
│   ├── llms-full.txt          # Generated complete codebase
│   ├── Gemfile                # Generated during build
│   └── _site/                 # Jekyll output (gitignored)
├── scripts/                   # Build scripts
│   ├── build-docs.js          # Copy documentation files
│   ├── generate-llms-txt.js   # Generate LLM files
│   └── package.json           # ES module support
├── .github/workflows/docs.yml # GitHub Actions workflow
├── docs/                      # Source user documentation
└── src/*/README.md            # Source internal documentation
```

## Key Features

### Organized Navigation
- Two-section sidebar: "How to Use" and "How it Works"
- Automatic ordering based on front matter
- Active page highlighting

### Source Links
- Internal documentation shows source file links
- Direct links to GitHub for easy editing

### LLM Support
- Auto-generated llms.txt files
- Optimized for AI consumption and analysis
- Includes complete codebase and documentation

### Responsive Design
- Mobile-friendly layout
- Collapsible sidebar on small screens
- Clean, readable typography

## Adding New Documentation

### User Documentation
1. Create markdown file in `docs/`
2. Add to `_user_docs/` with front matter:
   ```yaml
   ---
   title: Document Title
   description: Brief description
   order: 1
   ---
   ```

### Internal Documentation
1. Create or update README.md in the appropriate `src/` subdirectory
2. Add mapping to `scripts/build-docs.js` if it's a new location
3. The build script will automatically copy it with front matter

## Configuration

### Jekyll (`_config.yml`)
- Site metadata and URLs
- Collections configuration
- Navigation structure
- Plugin settings

### GitHub Actions (`.github/workflows/docs.yml`)
- Builds on push to main
- Runs build scripts
- Deploys to GitHub Pages
- Handles Ruby/Jekyll dependencies

### Styling (`assets/css/style.scss`)
- Custom CSS extending Minima theme
- Documentation-specific styling
- Responsive design rules
- Color scheme and typography

## Troubleshooting

### Build Failures
1. Check that all referenced files exist
2. Verify Jekyll front matter syntax
3. Ensure Ruby/Jekyll dependencies are installed
4. Check GitHub Actions logs for specific errors

### Missing Documentation
1. Run `npm run docs:build` to regenerate
2. Check that source README files exist
3. Verify mappings in `build-docs.js`

### Styling Issues
1. Check SCSS syntax in `style.scss`
2. Verify Jekyll is processing CSS correctly
3. Clear browser cache for local testing

## Deployment

The site deploys automatically to GitHub Pages at:
`https://svallory.github.io/tmgrammar-toolkit/`

Manual deployment is also possible via the GitHub Actions workflow dispatch.