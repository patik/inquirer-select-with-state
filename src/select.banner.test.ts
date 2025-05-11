import { Separator } from '@inquirer/core'
import { render } from '@inquirer/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { magenta } from 'yoctocolors'
import select from './select.ts'

const numberedChoices = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10 },
    { value: 11 },
    { value: 12 },
] as const

afterEach(() => {
    vi.useRealTimers()
})

const printExampleBanner = ({
    first,
    second,
    third,
}: { first?: string; second?: string; third?: string } = {}) => `${magenta('Stateful banner')}
  First timer:      ${first ? '✅' : '⚠️'} ${first ? 'finished' : 'pending...'}
  Second timer:     ${second ? '✅' : '⚠️'} ${second ? 'finished' : 'pending...'}
  Third timer:      ${third ? '✅' : '⚠️'} ${third ? 'finished' : 'pending...'}
`

type Names = 'first' | 'second' | 'third'

const statefulBanner = (setState: (s: string) => void) => {
    // Print the initial banner, e.g. as a placeholder
    setState(printExampleBanner())

    const timestamps: Record<Names, string> = { first: '', second: '', third: '' }
    const timers: Record<Names, NodeJS.Timeout | undefined> = { first: undefined, second: undefined, third: undefined }

    const randomTimeout = (x: keyof typeof timers, timeout: number) =>
        new Promise((resolve) => {
            timers[x] = setTimeout(resolve, timeout)
        }).then(() => {
            timestamps[x] = 'finished'
            setState(printExampleBanner(timestamps))
        })

    // Run the random timeouts in parallel
    Promise.all([randomTimeout('first', 4000), randomTimeout('second', 2000), randomTimeout('third', 6000)])

    // Cleanup the timers
    return () => Object.values(timers).forEach(clearTimeout)
}

describe('select prompt with stateful banner', () => {
    describe('the banner can update asynchronously', () => {
        it('the banner can update asynchronously', async () => {
            const { getScreen } = await render(select, {
                message: 'Select a number',
                choices: numberedChoices.slice(0, 3),
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
      "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2
  3"
            `)

            // wait a couple seconds, and one of the timer will finish
            await new Promise((resolve) => setTimeout(resolve, 2500))

            expect(getScreen()).toMatchInlineSnapshot(`
      "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ✅ finished
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2
  3"
            `)

            // wait 2 more seconds, and the next timer will finish
            await new Promise((resolve) => setTimeout(resolve, 2000))

            expect(getScreen()).toMatchInlineSnapshot(`
      "Stateful banner
  First timer:      ✅ finished
  Second timer:     ✅ finished
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2
  3"
            `)

            // wait 2 more seconds, and the last timer will finish
            await new Promise((resolve) => setTimeout(resolve, 2000))

            expect(getScreen()).toMatchInlineSnapshot(`
      "Stateful banner
  First timer:      ✅ finished
  Second timer:     ✅ finished
  Third timer:      ✅ finished

? Select a number
❯ 1
  2
  3"
            `)
        }, 15000)
    })

    describe('the first-party functionality of the prompt is not affected by the stateful banner', () => {
        it('use arrow keys to select an option', async () => {
            const { answer, events, getScreen } = await render(select, {
                message: 'Select a number',
                choices: numberedChoices.slice(0, 4),
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
      "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2
  3
  4"
    `)

            events.keypress('down')
            events.keypress('down')
            expect(getScreen()).toMatchInlineSnapshot(`
          "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
  1
  2
❯ 3
  4"
        `)

            events.keypress('enter')
            expect(getScreen()).toMatchInlineSnapshot(`
          "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

✔ Select a number 3"
`)

            await expect(answer).resolves.toEqual(3)
        })

        it('allow selecting the first option', async () => {
            const { answer, events, getScreen } = await render(select, {
                message: 'Select a number',
                choices: numberedChoices.slice(0, 3),
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2
  3"
  `)

            events.keypress('enter')
            await expect(answer).resolves.toEqual(1)

            expect(getScreen()).toMatchInlineSnapshot(`
  "Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

✔ Select a number 1"`)
        })

        it('cycles through options', async () => {
            const { answer, events, getScreen } = await render(select, {
                message: 'Select a number',
                choices: numberedChoices,
                pageSize: 2,
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2"
    `)

            events.keypress('up')
            events.keypress('up')
            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 11
  12"
    `)

            events.keypress('enter')
            await expect(answer).resolves.toEqual(11)
        })

        it('does not scroll up beyond first item when not looping', async () => {
            const { answer, events, getScreen } = await render(select, {
                message: 'Select a number',
                choices: numberedChoices,
                pageSize: 2,
                loop: false,
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2"
`)

            events.keypress('up')
            events.keypress('up')
            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
❯ 1
  2"
`)

            events.keypress('enter')
            await expect(answer).resolves.toEqual(1)
        })

        it('does not scroll up beyond first selectable item when not looping', async () => {
            const { answer, events, getScreen } = await render(select, {
                message: 'Select a number',
                choices: [new Separator(), ...numberedChoices],
                pageSize: 2,
                loop: false,
                statefulBanner,
            })

            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
 ──────────────
❯ 1"
`)

            events.keypress('up')
            events.keypress('up')
            expect(getScreen()).toMatchInlineSnapshot(`
"Stateful banner
  First timer:      ⚠️ pending...
  Second timer:     ⚠️ pending...
  Third timer:      ⚠️ pending...

? Select a number
 ──────────────
❯ 1"
`)

            events.keypress('enter')
            await expect(answer).resolves.toEqual(1)
        })
    })
})
