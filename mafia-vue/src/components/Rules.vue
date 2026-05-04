<template>
    <article class="prose-page">
        <header class="prose-header">
            <h1>Classic Mafia Game Rules</h1>
        </header>
        <section>
            <h2>1. Game Setup</h2>
            <p>Classic Mafia Game is a professional version of <a href="https://en.wikipedia.org/wiki/Mafia_(party_game)">Mafia / Werewolf party game</a>.</p>
            <p>To play Classic Mafia, you need 10 players and a Host. Roles are distributed as follows: 1 Sheriff, 6 Villagers, 1 Godfather, 2 Mafias.</p>
            <p>Villagers and Sheriff are called <strong>red</strong> players, while Godfather and Mafias are called <strong>black</strong> players.</p>
            <p>Before the game starts, every player must be assigned an order (from 1 to 10) and a card. You can use <a href="https://mafia.brolia.com">our card shuffler</a> to assign both.</p>
        </section>

        <section>
            <h2>2. Game Flow</h2>

            <h3>2.a. Zeroeth night</h3>
            <p>In the beginning of the game the host tells all players to "sleep" — meaning all players must close their eyes and / or use a face mask.</p>
            <p>After that the host wakes up Mafia and Godfather. Godfather identifies herself with a gesture (pointing to a shoulder) and gives orders for how players will be shot using only gestures. The easiest way to do so is static: the Godfather shows 3 numbers using fingers, e.g. 1 — 3 — 8. This means that on the 1st night player 1 will be shot, then player 3, and finally player 8. More elaborate (dynamic) ways to make an agreement are possible but require additional conversation.</p>
            <p>Mafia traditionally has 60 seconds to make an agreement; we usually use 80 seconds for Zoom to account for lag.</p>
            <p>Once Mafia's time is over, the host tells Mafia to go to sleep, then asks Godfather to make a gesture to identify herself for the host. Then asks Sheriff to do the same.</p>
            <p>Once the host knows Godfather, Mafias and Sheriff, the host tells everybody to wake up.</p>

            <h3>2.b. Zeroeth day</h3>
            <p>The host tells the village that there has been an arrival of Mafia and that there is also a Sheriff who would try to find them.</p>
            <p>During the Zeroeth day each player has 60 seconds to express their thoughts, in order, starting from player 1.</p>
            <p>The host traditionally warns players when only 10 seconds are left in their speech.</p>
            <p>Player 1 is usually expected to share some of the nightly thoughts she had, proving that she was actually asleep and not awake arranging strategy with Mafias.</p>
            <p>Every other player then traditionally shares thoughts about player 1 and all other players who spoke before. If there is time left during 60 seconds, players may also share their nightly thoughts.</p>
            <p>Players may add one other player to the voting list, but it is uncommon during the Zeroeth day. If only 1 player is added to the list on the Zeroeth day, no voting is held. If there are 2 or more players in the list, this triggers voting. A player who gets the most votes leaves the game. If the vote is split between 2 players (e.g. 5 for 1 and 5 for 3), they both get an additional 30 seconds to talk. If the vote is split a 2nd time, the vote is taken to kick both players from the table. This vote requires a simple majority.</p>
            <p>After every player has had their chance to speak, the host announces the beginning of the first night.</p>

            <h3>2.c. First night</h3>
            <p>During the first night the host first asks 3 Mafias (with Godfather) to show the number of the player they want to shoot using their fingers (for the Zoom version). IMPORTANT: Mafia does this with closed eyes. Then the host names every player from 1 to 10 and the Mafias also need to make a shooting gesture (closing fingers) on the number they want to shoot — this is just to double check the number. In the Zoom version, showing numbers on fingers usually takes precedence.</p>
            <p>If all 3 Mafias picked the same target, that player is shot, otherwise it's a miss.</p>
            <p>Once the count to 10 is complete, the host tells Mafia to put down the rifles and go to sleep.</p>
            <p>The host then wakes up the Godfather and the Godfather may ask the host who the Sheriff is by showing the number of the player she wants to check using fingers. If the Godfather guessed right, the host shows the Sheriff gesture (the OK gesture). Otherwise the host crosses hands / shakes head to show that the Godfather's guess was wrong.</p>
            <p>After that the Godfather goes to sleep.</p>
            <p>The host then wakes up the Sheriff and the Sheriff may check whether a player is Mafia by showing the player's number.</p>
            <p>If the player selected by the Sheriff is a Mafia or Godfather, the host shows a thumbs-down gesture. Otherwise the host shows a thumbs-up gesture.</p>
            <p>Once that's done, the host tells the Sheriff to go to sleep and wakes up the village.</p>

            <h3>2.d. First day</h3>
            <p>The first day is played similarly to the Zeroeth day with the following differences:</p>
            <ul>
                <li>In the beginning, the host announces if there were victims of Mafia's crimes. If so, a victim would be given a chance to leave a will and would have 60 seconds for that in the beginning of the round. Note that such a player may not put anyone to vote, just speak her opinion.</li>
                <li>The first day is started by player 2 (as opposed to player 1 starting the Zeroeth day). Note that if player 2 was shot at night, then player 3 starts. Accordingly, player 1 is the last one to speak on the first day.</li>
                <li>Even if there is only one candidate on the voting list, the voting will take place — all votes would go to that candidate in such a case.</li>
            </ul>

            <h3>2.e. Second and subsequent nights</h3>
            <p>Second and subsequent nights are played exactly like the first night. Even if Godfather and / or Sheriff were previously eliminated, the host still announces them — so as not to reveal the roles of eliminated players.</p>

            <h3>2.f. Second and subsequent days</h3>
            <p>Second and subsequent days are played exactly like the first day. However every time the speaking order is shifted by 1 (if the previous day was started by player 3, the next would be started by player 4 etc.).</p>
        </section>

        <section>
            <h2>Victory Conditions</h2>
            <p><strong>Mafia wins</strong> if the number of red and black players at the table is equal (e.g. 3-3, 2-2 or 1-1).</p>
            <p><strong>The Village</strong> wins if all black players were eliminated from the game.</p>
        </section>

        <section>
            <h2>Other considerations</h2>
            <p>In offline Classic Mafia, eliminated players should physically leave the table.</p>
            <p>In the Zoom / Jitsi version, we ask eliminated players to stop the camera and mute themselves.</p>
            <p>We'll try to add more details over time. For now, gather your friends and <a href="https://mafia.brolia.com">start your game!</a></p>
        </section>
    </article>
</template>

<script>
export default {
    name: 'Rules'
}
</script>

<style scoped>
.prose-page {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 2rem 2.25rem;
    max-width: 760px;
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
    margin: 1.75rem 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
}

.prose-page h3 {
    margin: 1.25rem 0 0.4rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--brand-primary-dark);
}

.prose-page p {
    margin: 0 0 0.8rem;
    color: var(--text);
}

.prose-page ul {
    padding-left: 1.25rem;
    margin: 0 0 0.8rem;
}

.prose-page li {
    margin-bottom: 0.4rem;
}

.prose-page a {
    color: var(--brand-accent);
    text-decoration: none;
    font-weight: 500;
}

.prose-page a:hover {
    text-decoration: underline;
}

@media (max-width: 720px) {
    .prose-page {
        padding: 1.25rem 1.1rem;
    }
}
</style>
