class GithubCard extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const repo = this.getAttribute('data-repo');
    if (!repo) return;

    // Loading State
    this.innerHTML = `
      <div class="flex items-center justify-center p-4 border border-black/10 dark:border-white/25 rounded-lg animate-pulse bg-black/5 dark:bg-white/5 not-prose my-4">
        <span class="text-sm text-black/50 dark:text-white/50">Loading repository...</span>
      </div>
    `;

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`);
      if (!response.ok) throw new Error('Repository not found');

      const data = await response.json();

      const fmt = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 });
      const formatNum = (num) => fmt.format(num).replaceAll(" ", '');

      this.innerHTML = `
        <style>
          .card-github {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
            border-radius: 8px;
            text-decoration: none;
            color: inherit;
            background: transparent;
            font-family: inherit;
            margin: 1rem 0;
            transition: border-color 0.3s ease;
          }
          :root.dark .card-github {
            border-color: rgba(255, 255, 255, 0.2);
          }
          .card-github:hover {
            border-color: rgba(0, 0, 0, 0.2);
          }
          :root.dark .card-github:hover {
            border-color: rgba(255, 255, 255, 0.4);
          }
          .gc-titlebar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
          }
          .gc-titlebar-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--text-color, #000);
          }
          :root.dark .gc-titlebar-left {
            color: #fff;
          }
          .gc-owner {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .gc-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: transparent;
          }
          .gc-divider {
            color: rgba(0, 0, 0, 0.4);
            font-weight: 400;
          }
          :root.dark .gc-divider {
            color: rgba(255, 255, 255, 0.4);
          }
          .gc-repo {
            color: #0969da;
          }
          :root.dark .gc-repo {
            color: #58a6ff;
          }
          .github-logo {
            width: 24px;
            height: 24px;
            background-color: currentColor;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>') no-repeat center / contain;
            mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>') no-repeat center / contain;
          }
          .gc-description {
            font-family: inherit;
            color: rgba(0, 0, 0, 0.6);
            font-size: 0.875rem;
            margin-bottom: 1rem;
            line-height: 1.5;
          }
          :root.dark .gc-description {
            color: rgba(255, 255, 255, 0.6);
          }
          .gc-infobar {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.8rem;
            color: rgba(0, 0, 0, 0.6);
          }
          :root.dark .gc-infobar {
            color: rgba(255, 255, 255, 0.6);
          }
          .gc-stars, .gc-forks {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .gc-stars::before {
            content: '';
            display: inline-block;
            width: 14px;
            height: 14px;
            background-color: currentColor;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>') no-repeat center / contain;
            mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>') no-repeat center / contain;
          }
          .gc-forks::before {
             content: '';
             display: inline-block;
             width: 14px;
             height: 14px;
             background-color: currentColor;
             -webkit-mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>') no-repeat center / contain;
             mask: url('data:image/svg+xml;utf8,<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>') no-repeat center / contain;
          }
          .gc-badges {
            display: flex;
            gap: 0.5rem;
            margin-left: auto;
          }
          .gc-license, .gc-language {
            background: rgba(0,0,0,0.05);
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
          }
          :root.dark .gc-license, :root.dark .gc-language {
            background: rgba(255,255,255,0.08);
          }
        </style>
        <a class="card-github not-prose" href="${data.html_url}" target="_blank" rel="noopener noreferrer">
          <div class="gc-titlebar">
            <div class="gc-titlebar-left">
              <div class="gc-owner">
                <div class="gc-avatar" style="background-image: url('${data.owner.avatar_url}');"></div>
                <div class="gc-user">${data.owner.login}</div>
              </div>
              <div class="gc-divider">/</div>
              <div class="gc-repo">${data.name}</div>
            </div>
            <div class="github-logo"></div>
          </div>
          <div class="gc-description">
            ${data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set"}
          </div>
          <div class="gc-infobar">
            <div class="gc-stars">${formatNum(data.stargazers_count)}</div>
            <div class="gc-forks">${formatNum(data.forks)}</div>
            <div class="gc-badges">
              ${data.license?.spdx_id ? `<span class="gc-license">${data.license.spdx_id}</span>` : ''}
              ${data.language ? `<span class="gc-language">${data.language}</span>` : ''}
            </div>
          </div>
        </a>
      `;
    } catch (error) {
      this.innerHTML = `
        <div class="p-4 border border-red-500/50 rounded-lg bg-red-500/10 text-red-500 text-sm my-4 not-prose">
          Failed to load repository: ${repo}
        </div>
      `;
    }
  }

  getLanguageColor(language) {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      'C#': '#178600',
      C: '#555555',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Vue: '#41b883',
      Ruby: '#701516',
      Go: '#00ADD8',
      Swift: '#F05138',
      Kotlin: '#A97BFF',
      Rust: '#dea584',
      Dart: '#00B4AB',
      PHP: '#4F5D95',
    };
    return colors[language] || '#cccccc';
  }
}

customElements.define('github-card', GithubCard);
