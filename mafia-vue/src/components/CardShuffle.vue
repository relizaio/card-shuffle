<template>
  <div class="room">
    <header class="room-header">
        <span class="room-eyebrow">Room</span>
        <h1 class="room-title">{{ room }}</h1>
    </header>

    <transition name="toast">
        <div v-if="alertVisible" class="toast-flash" role="status" @click="alertVisible = false">
            {{ alertMsg }}
        </div>
    </transition>

    <section class="panel players-panel">
        <header class="panel-header">
            <h2 class="panel-title">Players <span class="badge-count">{{ playerList.length }}</span></h2>
        </header>
        <div v-if="!playerList.length" class="empty-state">No players yet — share the room link.</div>
        <ul v-else class="player-list">
            <li v-for="p in playerList" :key="p.name" class="player-chip">
                <span
                    class="player-order"
                    :class="{ 'player-order-special': p.order === 'Host' || p.order === 'Guest' }"
                >{{ p.order }}</span>
                <span
                    class="player-name"
                    :class="{ clickable: canListenTo(p) }"
                    :title="canListenTo(p) ? 'Click to listen for this player\u2019s wink' : ''"
                    @click="listenTo(p.order)"
                >{{ p.name }}</span>
                <span v-if="p.admin" class="player-flag" title="Game Master"><b-icon-shield-shaded /></span>
                <span v-if="winkLink.includes(p.order)" class="player-flag flag-success" title="Player saw you winking"><b-icon-bullseye /></span>
                <span v-if="listenLink.includes(p.order)" class="player-flag flag-danger" title="Player winked to you"><b-icon-eye /></span>
                <select
                    v-if="admin"
                    class="player-order-select"
                    :value="p.order"
                    aria-label="Set player order"
                    @change="updatePlayerOrder($event.target.value, p.name)"
                >
                    <option v-for="i in computedOrderArray" :key="i" :value="i">{{ i }}</option>
                </select>
                <button
                    v-if="admin"
                    class="player-kick"
                    type="button"
                    title="Kick player"
                    @click="kickPlayer(p.name)"
                >&times;</button>
            </li>
        </ul>
    </section>

    <section v-if="admin" class="panel admin-panel">
        <header class="panel-header">
            <h2 class="panel-title">Game Master Controls</h2>
        </header>
        <div class="admin-actions">
            <button class="btn btn-primary" type="button" @click="shuffleOrder">Shuffle player order</button>
            <label class="inline-control">
                <span class="inline-label">Transfer Game Master to</span>
                <select class="form-control" :value="''" @change="onTransferAdmin($event)">
                    <option value="" disabled>Select player</option>
                    <option v-for="p in playerList" :key="p.name" :value="p.name">{{ p.name }}</option>
                </select>
            </label>
        </div>

        <div class="admin-distribution">
            <h3 class="admin-subtitle">Card distribution</h3>
            <p class="admin-hint">Distributed {{ distributedCards }} cards for {{ playersInGame.length }} players.</p>
            <div class="cards-grid">
                <label v-for="gamecard in Object.keys(cards)" :key="gamecard" class="card-cell">
                    <span class="card-cell-name">{{ gamecard }}</span>
                    <input
                        type="number"
                        min="0"
                        class="form-control card-cell-input"
                        v-model="cards[gamecard].num"
                    />
                </label>
                <button class="card-cell card-cell-add" type="button" title="Add custom role" @click="showAddRoleModal = true">
                    <b-icon-plus-circle />
                    <span>Add role</span>
                </button>
            </div>
            <button class="btn btn-primary" type="button" @click="shuffleCards">Shuffle cards</button>
        </div>

        <b-modal
            v-model="showAddRoleModal"
            id="modal-add-custom-role"
            title="Add Custom Role"
            :hide-footer="true"
        >
            <form class="modal-form" @submit.prevent="addRoleSubmit">
                <label class="form-field">
                    <span class="form-label">Role</span>
                    <input
                        id="add_custom_role_input"
                        class="form-control"
                        v-model="customRole"
                        required
                        placeholder="Name your custom role"
                    />
                </label>
                <label class="form-field">
                    <span class="form-label">Picture type</span>
                    <select id="add_custom_role_picture" class="form-control" v-model="customRolePicture">
                        <option v-for="opt in cardsWithImages" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </label>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Submit</button>
                    <button type="reset" class="btn btn-ghost" @click="customRole = ''">Reset</button>
                </div>
            </form>
        </b-modal>
    </section>

    <section v-if="hasPlayer" class="panel reveal-panel">
        <header class="panel-header">
            <h2 class="panel-title">Your seat</h2>
        </header>
        <div v-if="iPlayer.order === 'Guest'" class="reveal-text">
            Joined as <strong>{{ iPlayer.name }}</strong> &middot; <span class="role-pill role-guest">Guest</span>
        </div>
        <div v-else-if="iPlayer.order === 'Host'" class="reveal-host">
            <div class="reveal-text">
                Joined as <strong>{{ iPlayer.name }}</strong> &middot; <span class="role-pill role-host">Host</span>
                &middot; Game <strong>#{{ game }}</strong>
            </div>
            <ol v-if="hostGameArr.length" class="host-game-list">
                <li v-for="p in hostGameArr" :key="p.order">
                    <span class="host-order">{{ p.order }}</span>
                    <span class="host-card">{{ p.card }}</span>
                </li>
            </ol>
        </div>
        <div v-else class="reveal-player">
            <div class="reveal-text">
                Joined as <strong>{{ iPlayer.name }}</strong>
                <template v-if="iPlayer.card">
                    &middot; Game <strong>#{{ iPlayer.game }}</strong>
                </template>
            </div>
            <div v-if="iPlayer.card && game === iPlayer.game" class="card-reveal">
                <img class="card-image" :src="cardImage" :title="iPlayer.card" :alt="'Your card: ' + iPlayer.card" />
                <span class="card-name">{{ iPlayer.card }}</span>
            </div>
            <div v-if="game > 0 && game === iPlayer.game" class="wink-block">
                <p class="wink-help">Tap on a player's name in the list above to listen for their wink.</p>
                <label class="inline-control">
                    <span class="inline-label">Game {{ game }} &mdash; Wink to</span>
                    <select class="form-control" :value="''" @change="onWinkTo($event)">
                        <option value="" disabled>Select player</option>
                        <option v-for="p in playersInGame" :key="p.name" :value="p.order">{{ p.order }} &mdash; {{ p.name }}</option>
                    </select>
                </label>
            </div>
        </div>
    </section>

    <section class="panel join-panel">
        <header class="panel-header">
            <h2 class="panel-title">{{ hasPlayer ? 'Update your name' : 'Join this room' }}</h2>
        </header>
        <p v-if="!hasPlayer" class="join-hint">Enter your name to join.</p>
        <form class="join-form" @submit.prevent="submitName">
            <input
                id="enter-name-input"
                class="form-control"
                required
                v-model="playerName"
                :placeholder="hasPlayer ? 'New name' : 'Your name'"
            />
            <button type="submit" class="btn btn-primary">{{ hasPlayer ? 'Update' : 'Join' }}</button>
        </form>
    </section>
  </div>
</template>

<script>
let flashTimer = null

export default {
    name: 'CardShuffle',
    data () {
        return {
            admin: false,
            customRole: '',
            customRolePicture: '',
            winkLink: [],
            hostGameArr: [],
            game: 0,
            iPlayer: {},
            listenLink: [],
            room: this.$route.params.room,
            playerName: '',
            alertVisible: false,
            alertMsg: '',
            showAddRoleModal: false,
            playerList: [],
            cards: {
                sheriff: {
                    num: 1,
                    image: 'sheriff'
                },
                godfather: {
                    num: 1,
                    image: 'godfather'
                },
                mafia: {
                    num: 2,
                    image: 'mafia'
                },
                villager: {
                    num: 6,
                    image: 'villager'
                }
            },
            cardsWithImages: ['sheriff', 'godfather', 'mafia', 'villager'],
            imagePrefix: 'https://d7ge14utcyki8.cloudfront.net/mafia/'
        }
    },
    sockets: {
        adminmsg (msg) {
            this.flashAlert(msg)
        },
        winksuccess (order) {
            if (!this.winkLink.includes(order)) {
                this.winkLink.push(order)
            }
        },
        cardassigned (card) {
            this.flashAlert('You have been assigned a card: ' + card + '!')
            this.requestMyPlayer()
        },
        connect () {
            console.log('socket connected')
            this.requestRoom()
        },
        gamenumber (game) {
            this.game = game
        },
        gameset (hostGameObj) {
            let localGameArr = []
            if (hostGameObj) {
                Object.keys(hostGameObj).forEach(key => {
                    let playerObj = {
                        order: key,
                        card: hostGameObj[key]
                    }
                    localGameArr.push(playerObj)
                })
            }
            this.hostGameArr = localGameArr
            this.hostGameArr = this.hostGameArr.sort((a,b) => {
                return a.order - b.order
            })
        },
        joinedroom (name) {
            this.flashAlert(name + ' joined this game room!')
        },
        listensuccess (order) {
            if (!this.listenLink.includes(order)) {
                this.listenLink.push(order)
            }
        },
        nametaken () {
            this.flashAlert('Sorry, this name has already been taken!')
        },
        playerlist (list) {
            this.playerList = list
            this.requestMyPlayer()
        },
        orderchanged (player) {
            this.flashAlert('Game master changed order number of player ' + player.name + ' to ' + player.order)
        },
        ordershuffled () {
            this.flashAlert('Game master shuffled player order!')
        },
        youareadmin () {
            this.flashAlert('You are game master of this room!')
            this.admin = true
        },
        yourplayer (resp) {
            this.iPlayer = resp || {}
            if (resp) {
                this.admin = resp.admin
                this.game = resp.game
            }
        }
    },
    methods: {
        flashAlert (msg) {
            this.alertMsg = msg
            this.alertVisible = true
            if (flashTimer) clearTimeout(flashTimer)
            flashTimer = setTimeout(() => { this.alertVisible = false }, 5000)
        },
        addRoleSubmit () {
            this.cards[this.customRole] = {
                num: 0,
                image: this.customRolePicture
            }
            this.cards = Object.assign({}, this.cards)
            this.showAddRoleModal = false
            this.customRole = ''
        },
        canListenTo (p) {
            return p.order !== 'Host' && p.order !== 'Guest' && p.order !== this.iPlayer?.order
        },
        listenTo (order) {
            if (order !== 'Host' && order !== 'Guest' && order !== this.iPlayer.order) {
                let listObj = {
                    room: this.room,
                    listenTarget: order
                }
                this.$socket.emit('listenTo', listObj)
            }
        },
        onWinkTo (event) {
            const order = event.target.value
            event.target.value = ''
            if (!order) return
            this.winkTo(order)
        },
        winkTo (order) {
            if (order === this.iPlayer.order) {
                this.flashAlert('You cannot wink to yourself!')
            } else {
                this.$socket.emit('winkTo', { room: this.room, winkTarget: order })
            }
        },
        kickPlayer (name) {
            this.$socket.emit('kickplayer', { room: this.room, name })
        },
        requestMyPlayer () {
            this.$socket.emit('requestmyplayer', {
                uuid: window.localStorage.getItem('mafiaUuid'),
                room: this.room
            })
        },
        requestRoom () {
            this.$socket.emit('requestroom', {
                room: this.room,
                uuid: window.localStorage.getItem('mafiaUuid')
            })
        },
        shuffleCards () {
            if (this.distributedCards !== this.playersInGame.length) {
                this.flashAlert('You allocated ' + this.distributedCards + ' cards for ' + this.playersInGame.length + ' players! Numbers of cards and players must be equal!')
            } else {
                let cardsForShuffle = {}
                Object.keys(this.cards).forEach(ck => {
                    cardsForShuffle[ck] = this.cards[ck].num
                })
                this.$socket.emit('shufflecards', { room: this.room, cards: cardsForShuffle })
            }
        },
        shuffleOrder () {
            this.$socket.emit('shuffleorder', this.room)
        },
        submitName () {
            this.$socket.emit('joinroom', {
                room: this.room,
                name: this.playerName,
                uuid: window.localStorage.getItem('mafiaUuid')
            })
        },
        onTransferAdmin (event) {
            const name = event.target.value
            event.target.value = ''
            if (!name) return
            this.transferAdmin(name)
        },
        transferAdmin (name) {
            this.$socket.emit('transferGameMaster', { room: this.room, name })
            setTimeout(() => {
                this.requestMyPlayer()
            }, 1000)
        },
        updatePlayerOrder (order, player) {
            this.$socket.emit('updateorder', { room: this.room, player, order })
        }
    },
    created () {
        this.requestRoom()
    },
    beforeUnmount () {
        if (flashTimer) clearTimeout(flashTimer)
    },
    watch: {
        game () {
            this.winkLink = []
            this.listenLink = []
        }
    },
    computed: {
        hasPlayer () {
            return !!(this.iPlayer && Object.keys(this.iPlayer).length)
        },
        cardImage () {
            let cardImage = ''
            if (this.iPlayer && this.iPlayer.card && this.cardsWithImages.includes(this.cards[this.iPlayer.card].image)) {
                let maxNumImage = {
                    godfather: 15,
                    sheriff: 14,
                    mafia: 30,
                    villager: 58
                }
                let imagePostfix = 1 + Math.floor(Math.random() * maxNumImage[this.cards[this.iPlayer.card].image])
                cardImage = this.imagePrefix + this.cards[this.iPlayer.card].image + String(imagePostfix) + '.jpg'
            }
            return cardImage
        },
        computedOrderArray () {
            let orderList = [...Array(this.playerList.length).keys()]
            orderList.shift()
            orderList.push(this.playerList.length)
            orderList.push('Host')
            orderList.push('Guest')
            return orderList
        },
        playersInGame () {
            return this.playerList.filter(p => p.order !== 'Host' && p.order !== 'Guest')
        },
        distributedCards () {
            let numCards = 0
            Object.values(this.cards).forEach(val => {
                numCards += Number(val.num)
            })
            return numCards
        }
    }
}
</script>

<style scoped>
.room {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.room-header {
    text-align: center;
}

.room-eyebrow {
    display: inline-block;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    font-weight: 600;
}

.room-title {
    margin: 0.25rem 0 0;
    font-size: clamp(1.5rem, 3.2vw, 2.1rem);
    font-weight: 700;
    color: var(--brand-primary-dark);
    letter-spacing: -0.02em;
    word-break: break-all;
}

.toast-flash {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--brand-primary-dark);
    color: #fff;
    padding: 0.7rem 1.2rem;
    border-radius: 999px;
    box-shadow: var(--shadow-md);
    font-size: 0.95rem;
    z-index: 200;
    cursor: pointer;
    max-width: calc(100vw - 2rem);
    text-align: center;
}

.toast-enter-active, .toast-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from, .toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 12px);
}

.panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 1.25rem 1.25rem 1.4rem;
}

.admin-panel {
    border-color: rgba(155, 122, 113, 0.35);
    box-shadow: 0 0 0 1px rgba(155, 122, 113, 0.12), var(--shadow-md);
}

.panel-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.85rem;
}

.panel-title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
}

.badge-count {
    display: inline-block;
    background: var(--surface-muted);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    font-size: 0.85rem;
    font-weight: 600;
    margin-left: 0.4rem;
}

.empty-state {
    color: var(--text-muted);
    font-style: italic;
    padding: 0.5rem 0;
}

.player-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.player-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.3rem 0.7rem 0.3rem 0.35rem;
}

.player-order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.6rem;
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 999px;
    background: var(--brand-primary);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
}

.player-order-special {
    background: var(--text-muted);
}

.player-name {
    font-weight: 500;
}

.player-name.clickable {
    cursor: pointer;
    text-decoration: underline dotted;
    text-underline-offset: 3px;
}

.player-flag {
    display: inline-flex;
    align-items: center;
    color: var(--text-muted);
}

.player-flag.flag-success { color: #2d8a5f; }
.player-flag.flag-danger  { color: #c0392b; }

.player-order-select {
    margin-left: 0.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    padding: 0.15rem 0.3rem;
    font-size: 0.85rem;
    color: var(--text);
}

.player-kick {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
    border-radius: 999px;
}

.player-kick:hover {
    background: rgba(192, 57, 43, 0.12);
    color: #c0392b;
}

.admin-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    align-items: flex-end;
    margin-bottom: 1.2rem;
}

.inline-control {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.inline-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    font-weight: 600;
}

.admin-distribution {
    border-top: 1px dashed var(--border);
    padding-top: 1rem;
}

.admin-subtitle {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text);
}

.admin-hint {
    color: var(--text-muted);
    margin: 0 0 0.85rem;
    font-size: 0.9rem;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.card-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    background: var(--surface-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.6rem;
}

.card-cell-name {
    font-weight: 500;
    text-transform: capitalize;
    color: var(--text);
}

.card-cell-input {
    width: 4.5rem;
    text-align: right;
    padding: 0.3rem 0.5rem;
    font-size: 0.95rem;
}

.card-cell-add {
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    justify-content: center;
}

.card-cell-add:hover {
    color: var(--brand-primary-dark);
    border-color: var(--brand-primary);
}

.form-control {
    padding: 0.55rem 0.75rem;
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
    padding: 0.6rem 1.1rem;
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

.btn-ghost {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
}

.btn-ghost:hover {
    background: var(--surface-muted);
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.form-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
}

.modal-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.reveal-text {
    color: var(--text);
    font-size: 1rem;
}

.role-pill {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
}

.role-host { background: #e8f4ee; color: #1f6e4a; }
.role-guest { background: var(--surface-muted); color: var(--text-muted); }

.card-reveal {
    margin-top: 0.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.card-image {
    max-height: 320px;
    width: auto;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    background: var(--surface-muted);
}

.card-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--brand-primary-dark);
    text-transform: capitalize;
    letter-spacing: 0.02em;
}

.host-game-list {
    list-style: none;
    margin: 0.85rem 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.4rem;
}

.host-game-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--surface-muted);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.6rem;
}

.host-order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: var(--brand-primary);
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
}

.host-card {
    text-transform: capitalize;
}

.wink-block {
    margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px dashed var(--border);
}

.wink-help {
    color: var(--text-muted);
    margin: 0 0 0.6rem;
    font-size: 0.9rem;
}

.join-hint {
    color: var(--text-muted);
    margin: 0 0 0.6rem;
}

.join-form {
    display: flex;
    gap: 0.5rem;
}

.join-form .form-control {
    flex: 1;
}

@media (max-width: 520px) {
    .panel {
        padding: 1rem;
    }
    .admin-actions {
        flex-direction: column;
        align-items: stretch;
    }
    .admin-actions .inline-control,
    .admin-actions .btn {
        width: 100%;
    }
    .join-form {
        flex-direction: column;
    }
    .join-form .btn {
        width: 100%;
    }
}
</style>
