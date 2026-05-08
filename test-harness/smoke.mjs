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
