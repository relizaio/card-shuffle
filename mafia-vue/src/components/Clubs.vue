<template>
    <article class="prose-page">
        <header class="prose-header">
            <h1>Classic Mafia Clubs</h1>
        </header>
        <p>This page lists Classic Mafia clubs around the world.</p>
        <p>If you would like to see your club added here, contact <a href="https://twitter.com/taleodor">@taleodor</a>, or if you are tech-savvy, submit a pull request <a href="https://github.com/taleodor/mafia-vue/blob/master/src/components/Clubs.vue">here</a>.</p>

        <h2>English-speaking clubs</h2>
        <ul class="club-list">
            <li><a href="https://www.facebook.com/groups/226449514517735/">Vancouver Mafia Club</a></li>
            <li><a href="https://englishmafiaclub.com/">Kiev English Mafia Club</a></li>
        </ul>

        <h2>Russian-speaking clubs</h2>
        <ul class="club-list">
            <li><a href="https://www.facebook.com/FreudMafia/">Freud Mafia</a></li>
            <li><a href="https://www.facebook.com/groups/mafiagameottawa/">Mafia Club in Ottawa</a></li>
        </ul>
    </article>
</template>

<script>
export default {
    name: 'Clubs'
}
</script>

<style scoped>
.prose-page {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 2rem 2.25rem;
    max-width: 720px;
    margin: 0 auto;
}

.prose-header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.prose-page h1 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2rem);
    color: var(--brand-primary-dark);
    font-weight: 700;
    letter-spacing: -0.01em;
}

.prose-page h2 {
    margin: 1.5rem 0 0.5rem;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text);
}

.prose-page p {
    margin: 0 0 0.7rem;
}

.club-list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.club-list a {
    color: var(--brand-accent);
    text-decoration: none;
    font-weight: 500;
}

.club-list a:hover {
    text-decoration: underline;
}

@media (max-width: 720px) {
    .prose-page {
        padding: 1.25rem 1.1rem;
    }
}
</style>
