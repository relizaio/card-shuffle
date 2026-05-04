<template>
    <div class="home">
        <section class="hero">
            <h1 class="hero-title">Welcome to Mafia Card Shuffle</h1>
            <p class="hero-subtitle">
                Deal roles for the Classic Mafia / Werewolf party game.
                Create or join a room — share the link with your friends, and play.
            </p>
        </section>
        <section class="join-card">
            <form class="join-form" @submit.prevent="submitRoom">
                <label for="enter-room" class="form-label">Room name</label>
                <div class="input-row">
                    <input
                        id="enter-room"
                        v-model="room"
                        required
                        class="form-control"
                        placeholder="Type a room name to create or join"
                    />
                    <button type="submit" class="btn btn-primary">Join room</button>
                </div>
            </form>
            <div class="divider"><span>or</span></div>
            <button class="btn btn-secondary btn-block" @click="generateRoom">
                Generate a random room for me
            </button>
        </section>
    </div>
</template>

<script>
export default {
    name: 'Home',
    data () {
        return {
            room: ''
        }
    },
    methods: {
        generateRoom () {
            this.room = 'xxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
            this.submitRoom()
        },
        submitRoom () {
            this.$router.push({ name: 'RoomShuffle', params: { room: this.room } })
        }
    }
}
</script>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    align-items: center;
}

.hero {
    text-align: center;
    max-width: 640px;
    padding: 1rem 0 0.25rem;
}

.hero-title {
    margin: 0 0 0.5rem;
    font-size: clamp(1.75rem, 3.5vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--brand-primary-dark);
}

.hero-subtitle {
    margin: 0;
    color: var(--text-muted);
    font-size: 1.05rem;
}

.join-card {
    width: 100%;
    max-width: 520px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 1.5rem;
    box-sizing: border-box;
}

.join-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.input-row {
    display: flex;
    gap: 0.5rem;
}

.form-control {
    flex: 1;
    padding: 0.65rem 0.85rem;
    font-size: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    transition: border-color 0.15s, box-shadow 0.15s;
    min-width: 0;
}

.form-control:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(155, 122, 113, 0.18);
}

.btn {
    border: 0;
    border-radius: var(--radius-sm);
    padding: 0.65rem 1.1rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s;
    white-space: nowrap;
}

.btn:active {
    transform: translateY(1px);
}

.btn-primary {
    background: var(--brand-primary);
    color: #fff;
}

.btn-primary:hover {
    background: var(--brand-primary-dark);
}

.btn-secondary {
    background: var(--surface-muted);
    color: var(--text);
    border: 1px solid var(--border);
}

.btn-secondary:hover {
    background: #ece5dd;
}

.btn-block {
    display: block;
    width: 100%;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-muted);
    margin: 1rem 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.divider::before,
.divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--border);
}

.divider span {
    padding: 0 0.75rem;
}

@media (max-width: 520px) {
    .input-row {
        flex-direction: column;
    }
    .btn {
        width: 100%;
    }
}
</style>
