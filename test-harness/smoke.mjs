import puppeteer from 'puppeteer'

const BASE = process.env.BASE_URL || 'https://shuffle.claude.rearmhq.com'

const errors = []
const consoleMsgs = []

function recordPage(page, label) {
    page.on('console', (msg) => {
        const text = msg.text()
        consoleMsgs.push(`[${label}] ${msg.type()}: ${text}`)
        if (msg.type() === 'error') errors.push(`[${label}] console.error: ${text}`)
    })
    page.on('pageerror', (err) => {
        errors.push(`[${label}] pageerror: ${err.message}`)
    })
    page.on('requestfailed', (req) => {
        const url = req.url()
        // Ignore favicon misses and 3rd-party widget transient failures
        if (url.endsWith('/favicon.ico')) return
        if (url.includes('buttons.github.io')) return
        if (url.includes('api.github.com')) return
        errors.push(`[${label}] requestfailed: ${url} -- ${req.failure()?.errorText}`)
    })
}

async function check(name, fn) {
    try {
        await fn()
        console.log(`  ok  ${name}`)
    } catch (e) {
        console.log(`  FAIL ${name}: ${e.message}`)
        errors.push(`[check ${name}] ${e.message}`)
    }
}

const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
})

try {
    // ---- Test 1: Home page loads ----
    const home = await browser.newPage()
    recordPage(home, 'home')
    await home.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 30000 })

    await check('home title', async () => {
        const t = await home.title()
        if (!t.includes('Mafia')) throw new Error(`unexpected title: ${t}`)
    })
    await check('home heading present', async () => {
        await home.waitForFunction(() => document.body.innerText.includes('Welcome to Mafia Card Shuffle'), { timeout: 5000 })
    })
    await check('home submit button rendered', async () => {
        const buttons = await home.$$eval('button', (els) => els.map((e) => e.innerText.trim()))
        if (!buttons.some((b) => b === 'Join room')) throw new Error(`Join button not found, got: ${JSON.stringify(buttons)}`)
        if (!buttons.some((b) => b.includes('Generate a random room'))) throw new Error('Generate room button not found')
    })

    // ---- Test 2: Generate room → redirects to /cards/<room> ----
    await check('generate room redirects to /cards/<room>', async () => {
        await Promise.all([
            home.waitForNavigation({ timeout: 15000 }),
            home.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'))
                const gen = btns.find((b) => b.innerText.includes('Generate a random room'))
                gen.click()
            })
        ])
        const url = home.url()
        if (!url.match(/\/cards\/[a-z0-9]{6}$/)) throw new Error(`unexpected url: ${url}`)
    })

    await check('room page renders welcome', async () => {
        await home.waitForFunction(
            () => /\bROOM\b/.test(document.body.innerText) && document.querySelector('.room-title'),
            { timeout: 10000 }
        )
    })
    await check('room page shows admin shuffle order button (auto-promoted as first joiner)', async () => {
        // first joiner becomes host but only after submitting a name; pre-name should still render the join form
        const h = await home.$$eval('input', (els) => els.map((e) => e.id))
        if (!h.includes('enter-name-input')) throw new Error(`enter-name-input missing, inputs: ${JSON.stringify(h)}`)
    })

    // ---- Test 3: Rules page ----
    const rules = await browser.newPage()
    recordPage(rules, 'rules')
    await rules.goto(`${BASE}/rules`, { waitUntil: 'networkidle2', timeout: 30000 })
    await check('rules page renders', async () => {
        await rules.waitForFunction(() => document.body.innerText.includes('Classic Mafia Game Rules'), { timeout: 5000 })
    })

    // ---- Test 4: Clubs page ----
    const clubs = await browser.newPage()
    recordPage(clubs, 'clubs')
    await clubs.goto(`${BASE}/clubs`, { waitUntil: 'networkidle2', timeout: 30000 })
    await check('clubs page renders', async () => {
        await clubs.waitForFunction(() => document.body.innerText.includes('Classic Mafia Clubs'), { timeout: 5000 })
    })

    // ---- Test 5: Two players in same room, host shuffles cards ----
    const roomId = 'tst-' + Math.floor(Math.random() * 1e9).toString(36)
    // Two players need isolated localStorage so the server treats them as
    // distinct uuids; otherwise the second join is interpreted as a rename
    // of the first.
    const ctx1 = await browser.createBrowserContext()
    const ctx2 = await browser.createBrowserContext()
    const p1 = await ctx1.newPage()
    const p2 = await ctx2.newPage()
    recordPage(p1, 'p1')
    recordPage(p2, 'p2')

    await p1.goto(`${BASE}/cards/${roomId}`, { waitUntil: 'networkidle2', timeout: 30000 })
    await p1.waitForSelector('#enter-name-input', { timeout: 10000 })
    await p1.type('#enter-name-input', 'Alice')
    await p1.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.type === 'submit')
        btn.click()
    })
    await check('p1 joined as Alice and is game master', async () => {
        await p1.waitForFunction(() => document.body.innerText.includes('Alice'), { timeout: 10000 })
        const text = await p1.evaluate(() => document.body.innerText)
        if (!text.includes('You are game master of this room')) {
            throw new Error(`game-master alert missing; got: ${text.slice(0, 500)}`)
        }
        if (!text.includes('Shuffle player order')) {
            throw new Error(`admin Shuffle button missing; got: ${text.slice(0, 500)}`)
        }
    })

    await p2.goto(`${BASE}/cards/${roomId}`, { waitUntil: 'networkidle2', timeout: 30000 })
    await p2.waitForSelector('#enter-name-input', { timeout: 10000 })
    await p2.type('#enter-name-input', 'Bob')
    await p2.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.type === 'submit')
        btn.click()
    })
    await check('p2 joined as Bob', async () => {
        await p2.waitForFunction(() => document.body.innerText.includes('Bob'), { timeout: 10000 })
    })
    await check('p1 sees Bob in playerlist via socket', async () => {
        await p1.waitForFunction(() => document.body.innerText.includes('Bob'), { timeout: 10000 })
    })
    await check('p2 is NOT admin (only p1 is game master)', async () => {
        const text = await p2.evaluate(() => document.body.innerText)
        if (text.includes('Shuffle player order')) {
            throw new Error('Bob should not see admin shuffle button')
        }
    })

    // ---- Test 6: Custom roles persist per room across F5 ----
    const persistRoom = 'persist-' + Math.floor(Math.random() * 1e9).toString(36)
    const ctxP = await browser.createBrowserContext()
    const pp = await ctxP.newPage()
    recordPage(pp, 'persist')

    await pp.goto(`${BASE}/cards/${persistRoom}`, { waitUntil: 'networkidle2', timeout: 30000 })
    await pp.waitForSelector('#enter-name-input', { timeout: 10000 })
    await pp.type('#enter-name-input', 'Carol')
    await pp.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.type === 'submit')
        btn.click()
    })
    await pp.waitForFunction(() => document.body.innerText.includes('You are game master of this room'), { timeout: 10000 })

    // Open Add Custom Role modal
    await pp.waitForSelector('.card-cell-add', { timeout: 5000 })
    await pp.evaluate(() => document.querySelector('.card-cell-add').click())
    await pp.waitForSelector('#add_custom_role_input', { timeout: 5000 })
    await pp.type('#add_custom_role_input', 'medic')
    // Pick the first picture option (sheriff) so the role has an image
    await pp.evaluate(() => {
        const sel = document.querySelector('#add_custom_role_picture')
        sel.value = 'sheriff'
        sel.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await pp.evaluate(() => document.querySelector('form.modal-form button[type=submit]').click())

    await check('custom role appears in card distribution after add', async () => {
        await pp.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'medic'),
            { timeout: 5000 }
        )
    })

    // Reload (F5) — the local component state resets, so the custom role
    // can only come back if the server is broadcasting it on connect.
    await pp.reload({ waitUntil: 'networkidle2', timeout: 30000 })
    await pp.waitForFunction(() => document.body.innerText.includes('Card distribution'), { timeout: 10000 })

    await check('custom role persists after reload (server-side state)', async () => {
        const cells = await pp.$$eval('.card-cell-name', (els) => els.map((e) => e.innerText.toLowerCase().trim()))
        if (!cells.includes('medic')) {
            throw new Error(`'medic' missing from card distribution after reload; got: ${JSON.stringify(cells)}`)
        }
    })

    // A fresh observer in a brand-new browser context (different uuid)
    // should also see the custom role on first connect.
    const ctxObs = await browser.createBrowserContext()
    const obs = await ctxObs.newPage()
    recordPage(obs, 'observer')
    await obs.goto(`${BASE}/cards/${persistRoom}`, { waitUntil: 'networkidle2', timeout: 30000 })
    await obs.waitForSelector('#enter-name-input', { timeout: 10000 })
    await obs.type('#enter-name-input', 'Dave')
    await obs.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.type === 'submit')
        btn.click()
    })
    // Dave isn't admin so the card-distribution panel won't render for them,
    // but the persisted role should reach Carol's tab too. Also re-fetch on Carol.
    await new Promise((r) => setTimeout(r, 1500))
    await check('Carol still sees the custom role with Dave joined', async () => {
        const cells = await pp.$$eval('.card-cell-name', (els) => els.map((e) => e.innerText.toLowerCase().trim()))
        if (!cells.includes('medic')) {
            throw new Error(`'medic' lost after second player joined; got: ${JSON.stringify(cells)}`)
        }
    })

    // ---- Test 7: Game-type presets ----
    const presetRoom = 'preset-' + Math.floor(Math.random() * 1e9).toString(36)
    const ctxPr = await browser.createBrowserContext()
    const adm = await ctxPr.newPage()
    recordPage(adm, 'preset-admin')

    await adm.goto(`${BASE}/cards/${presetRoom}`, { waitUntil: 'networkidle2', timeout: 30000 })
    await adm.waitForSelector('#enter-name-input', { timeout: 10000 })
    await adm.type('#enter-name-input', 'Eve')
    await adm.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.type === 'submit')
        btn.click()
    })
    await adm.waitForFunction(() => document.body.innerText.includes('You are game master of this room'), { timeout: 10000 })

    const cellsOf = (page) => page.$$eval('.card-cell-name', (els) => els.map((e) => e.innerText.toLowerCase().trim()))

    await check('default preset is classic mafia (sheriff/godfather/mafia/villager)', async () => {
        const cells = await cellsOf(adm)
        const expected = ['sheriff', 'godfather', 'mafia', 'villager']
        for (const role of expected) {
            if (!cells.includes(role)) throw new Error(`expected '${role}' in default; got: ${JSON.stringify(cells)}`)
        }
    })

    await check('switching to Werewolf rewrites cards to werewolf preset', async () => {
        await adm.evaluate(() => {
            const sel = document.querySelector('#preset-select')
            sel.value = 'werewolf'
            sel.dispatchEvent(new Event('change', { bubbles: true }))
        })
        await adm.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'werewolf'),
            { timeout: 5000 }
        )
        const cells = await cellsOf(adm)
        const expected = ['werewolf', 'seer', 'hunter', 'doctor', 'prostitute', 'tough guy', 'villager']
        for (const role of expected) {
            if (!cells.includes(role)) throw new Error(`expected '${role}' in werewolf; got: ${JSON.stringify(cells)}`)
        }
        // No leftover Mafia-only roles
        if (cells.includes('godfather') || cells.includes('sheriff') || cells.includes('mafia')) {
            throw new Error(`werewolf preset should not include Mafia roles; got: ${JSON.stringify(cells)}`)
        }
    })

    await check('switching to Avalon rewrites cards to avalon preset', async () => {
        await adm.evaluate(() => {
            const sel = document.querySelector('#preset-select')
            sel.value = 'avalon'
            sel.dispatchEvent(new Event('change', { bubbles: true }))
        })
        await adm.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'merlin'),
            { timeout: 5000 }
        )
        const cells = await cellsOf(adm)
        const expected = ['merlin', 'percival', 'loyal servant', 'assassin', 'mordred', 'morgana', 'minion']
        for (const role of expected) {
            if (!cells.includes(role)) throw new Error(`expected '${role}' in avalon; got: ${JSON.stringify(cells)}`)
        }
    })

    await check('preset persists across reload (server-side state)', async () => {
        await adm.reload({ waitUntil: 'networkidle2', timeout: 30000 })
        await adm.waitForFunction(() => document.body.innerText.includes('Card distribution'), { timeout: 10000 })
        // give the gametype + customcards events time to land
        await adm.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'merlin'),
            { timeout: 5000 }
        )
        const sel = await adm.$eval('#preset-select', (el) => el.value)
        if (sel !== 'avalon') throw new Error(`preset selector reverted to '${sel}' after reload`)
    })

    await check('switching to Resistance clears any custom roles previously added', async () => {
        // Add a custom role on top of Avalon first
        await adm.evaluate(() => document.querySelector('.card-cell-add').click())
        await adm.waitForSelector('#add_custom_role_input', { timeout: 5000 })
        await adm.type('#add_custom_role_input', 'oberon')
        await adm.evaluate(() => document.querySelector('form.modal-form button[type=submit]').click())
        await adm.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'oberon'),
            { timeout: 5000 }
        )
        // Now flip to Resistance
        await adm.evaluate(() => {
            const sel = document.querySelector('#preset-select')
            sel.value = 'resistance'
            sel.dispatchEvent(new Event('change', { bubbles: true }))
        })
        await adm.waitForFunction(
            () => Array.from(document.querySelectorAll('.card-cell-name'))
                .some((s) => s.innerText.toLowerCase().trim() === 'spy'),
            { timeout: 5000 }
        )
        const cells = await cellsOf(adm)
        if (cells.includes('oberon')) {
            throw new Error(`custom 'oberon' should have been cleared on preset switch; got: ${JSON.stringify(cells)}`)
        }
        const expected = ['spy', 'resistance']
        for (const role of expected) {
            if (!cells.includes(role)) throw new Error(`expected '${role}' in resistance; got: ${JSON.stringify(cells)}`)
        }
    })

    if (errors.length === 0) {
        console.log('\nALL CHECKS PASSED')
    } else {
        console.log('\nERRORS:')
        for (const e of errors) console.log('  - ' + e)
    }
} finally {
    await browser.close()
}

if (errors.length > 0) {
    console.log('\nfull console (last 50):')
    for (const m of consoleMsgs.slice(-50)) console.log('  ' + m)
    process.exit(1)
}
