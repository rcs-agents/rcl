// Theme management for tmgrammar-toolkit documentation

(function() {
  'use strict';

  // Initialize theme management
  function initThemes() {
    initDarkMode();
    initCodeTheme();
    initMermaid();
  }

  // Dark mode toggle functionality
  function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update Mermaid theme if it exists
    if (window.mermaid) {
      updateMermaidTheme(theme);
    }
    
    // Update code theme based on dark mode
    updateCodeTheme();
  }

  // Code theme selector functionality
  function initCodeTheme() {
    const selector = document.getElementById('code-theme');
    if (!selector) return;

    // Get saved code theme or default based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const defaultCodeTheme = currentTheme === 'dark' ? 'github-dark' : 'github-light';
    const savedCodeTheme = localStorage.getItem('code-theme') || defaultCodeTheme;
    
    selector.value = savedCodeTheme;
    
    // Initialize Shiki
    loadShiki().then(() => {
      setCodeTheme(savedCodeTheme);
    });

    selector.addEventListener('change', (e) => {
      const codeTheme = e.target.value;
      setCodeTheme(codeTheme);
      localStorage.setItem('code-theme', codeTheme);
    });
  }

  async function loadShiki() {
    if (window.shikiLoaded) return;
    
    try {
      // Load Shiki from CDN
      const shiki = await import('https://esm.sh/shiki@0.14.1');
      const highlighter = await shiki.getHighlighter({
        themes: ['github-light', 'github-dark', 'dracula', 'nord', 'one-dark-pro', 'material-theme-palenight'],
        langs: ['typescript', 'javascript', 'bash', 'json', 'yaml', 'markdown', 'html', 'css']
      });
      
      window.shikiHighlighter = highlighter;
      window.shikiLoaded = true;
      
      // Highlight existing code blocks
      highlightCodeBlocks();
    } catch (error) {
      console.warn('Failed to load Shiki:', error);
      // Fallback to basic styling
    }
  }

  function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
      const pre = block.parentElement;
      if (pre.classList.contains('shiki-processed')) return;
      
      // Detect language from class
      const langClass = [...block.classList].find(cls => cls.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'text';
      
      // Store original content
      const code = block.textContent;
      block.setAttribute('data-original-code', code);
      block.setAttribute('data-lang', lang);
      
      pre.classList.add('shiki-processed');
    });
    
    // Apply current theme
    const currentCodeTheme = localStorage.getItem('code-theme') || 'github-light';
    setCodeTheme(currentCodeTheme);
  }

  function setCodeTheme(theme) {
    if (!window.shikiHighlighter) {
      // Store theme for when Shiki loads
      window.pendingCodeTheme = theme;
      return;
    }

    const codeBlocks = document.querySelectorAll('pre.shiki-processed code');
    
    codeBlocks.forEach(block => {
      const code = block.getAttribute('data-original-code');
      const lang = block.getAttribute('data-lang') || 'text';
      
      try {
        const highlighted = window.shikiHighlighter.codeToHtml(code, {
          lang: lang,
          theme: theme
        });
        
        // Extract just the inner HTML from the pre tag
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlighted;
        const shikiPre = tempDiv.querySelector('pre');
        
        if (shikiPre) {
          block.parentElement.innerHTML = shikiPre.innerHTML;
          block.parentElement.className = `shiki ${theme}`;
        }
      } catch (error) {
        console.warn(`Failed to highlight code block with lang "${lang}":`, error);
        // Keep original content
      }
    });
  }

  function updateCodeTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const selector = document.getElementById('code-theme');
    if (!selector) return;

    // Auto-switch code theme based on dark mode if user hasn't explicitly set it
    const savedCodeTheme = localStorage.getItem('code-theme');
    if (!savedCodeTheme) {
      const autoTheme = currentTheme === 'dark' ? 'github-dark' : 'github-light';
      selector.value = autoTheme;
      setCodeTheme(autoTheme);
    }
  }

  // Mermaid theme management
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateMermaidTheme(currentTheme);
  }

  function updateMermaidTheme(theme) {
    if (typeof mermaid === 'undefined') return;

    const mermaidTheme = theme === 'dark' ? 'dark' : 'default';
    
    mermaid.initialize({
      theme: mermaidTheme,
      themeVariables: theme === 'dark' ? {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#334155',
        lineColor: '#64748b',
        sectionFill: '#1e293b',
        altSectionFill: '#334155',
        gridColor: '#475569',
        tertiaryColor: '#0f172a',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        tertiaryBkg: '#475569'
      } : {
        primaryColor: '#2563eb',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#e2e8f0',
        lineColor: '#64748b',
        sectionFill: '#f8fafc',
        altSectionFill: '#f1f5f9',
        gridColor: '#cbd5e1',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#f8fafc',
        secondBkg: '#f1f5f9',
        tertiaryBkg: '#e2e8f0'
      }
    });

    // Re-render existing diagrams
    const diagrams = document.querySelectorAll('.mermaid');
    diagrams.forEach((diagram, index) => {
      const graphDefinition = diagram.getAttribute('data-original') || diagram.textContent;
      diagram.setAttribute('data-original', graphDefinition);
      diagram.innerHTML = '';
      mermaid.render(`mermaid-${index}`, graphDefinition, (svgCode) => {
        diagram.innerHTML = svgCode;
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemes);
  } else {
    initThemes();
  }

})();