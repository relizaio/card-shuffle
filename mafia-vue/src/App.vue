<template>
    <div id="app">
        <header class="app-header">
            <div class="brand">
                <router-link to="/" class="brand-link" aria-label="Mafia Card Shuffle home">
                    <img class="brand-logo" src="/logo_svg_no_tag_3.svg" alt="" />
                    <span class="brand-text">Mafia Card Shuffle</span>
                </router-link>
            </div>
            <nav class="primary-nav" aria-label="Primary">
                <router-link to="/" class="shf-nav-link" exact-active-class="active">Home</router-link>
                <router-link to="/rules" class="shf-nav-link" active-class="active">Rules</router-link>
                <router-link to="/clubs" class="shf-nav-link" active-class="active">Clubs</router-link>
            </nav>
            <div class="header-cta">
                <github-button href="https://github.com/relizaio/rearm"
                                data-icon="octicon-star"
                                data-size="large"
                                data-show-count="true"
                                aria-label="Support relizaio/rearm on GitHub">
                    Support our flagship project ReARM
                </github-button>
            </div>
        </header>
        <main class="app-main">
            <router-view :key="$route.fullPath" />
        </main>
        <footer class="app-footer">
            Powered by <a href="https://rearmhq.com">ReARM</a>
        </footer>
    </div>
</template>

<script>
import GithubButton from 'vue-github-button'

export default {
    name: 'App',
    components: {
        GithubButton
    },
    methods: {
        uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
        }
    },
    created () {
        window.document.title = 'Mafia Card Shuffle'
        let existingUuid = window.localStorage.getItem('mafiaUuid')
        if (!existingUuid) {
            let uuid = this.uuidv4()
            window.localStorage.setItem('mafiaUuid', uuid)
        }
    }
}
</script>

<style>
:root {
    --brand-primary: #9b7a71;
    --brand-primary-dark: #6f534b;
    --brand-accent: #2d8a5f;
    --surface: #ffffff;
    --surface-muted: #f6f3f0;
    --background: #f0ebe5;
    --background-grad: linear-gradient(180deg, #f4efe9 0%, #e9e2da 100%);
    --text: #2c2724;
    --text-muted: #6b615a;
    --border: #e2dad1;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
    --radius: 12px;
    --radius-sm: 8px;
}

html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background: var(--background-grad);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
        Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.app-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
}

.brand-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--text);
}

.brand-logo {
    width: 38px;
    height: 38px;
    display: block;
}

.brand-text {
    font-weight: 600;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    color: var(--brand-primary-dark);
}

.primary-nav {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
}

.shf-nav-link {
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: background 0.15s ease, color 0.15s ease;
}

.shf-nav-link:hover {
    background: var(--surface-muted);
    color: var(--text);
}

.shf-nav-link.active {
    background: var(--brand-primary);
    color: #fff;
}

.header-cta {
    display: flex;
    align-items: center;
}

.app-main {
    flex: 1;
    padding: 2rem 1.5rem;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.app-footer {
    text-align: center;
    padding: 1.25rem 1rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: var(--surface);
}

.app-footer a {
    color: var(--brand-accent);
    font-weight: 500;
    text-decoration: none;
}

.app-footer a:hover {
    text-decoration: underline;
}

@media (max-width: 720px) {
    .app-header {
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.6rem 0.9rem;
    }
    .brand-text {
        display: none;
    }
    .primary-nav {
        order: 3;
        flex-basis: 100%;
        justify-content: center;
        margin-left: 0;
        margin-top: 0.25rem;
    }
    .header-cta {
        margin-left: auto;
    }
    .app-main {
        padding: 1.25rem 1rem;
    }
}
</style>
