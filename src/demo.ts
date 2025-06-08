import { Separator } from '@inquirer/core'
import { magenta } from 'yoctocolors'
import select from './select.js'

const printExampleBanner = ({
    first,
    second,
    third,
}: { first?: string; second?: string; third?: string } = {}) => `${magenta('Stateful banner')}
    First timer:      ${first ? '✅' : '⚠️'} ${first ?? ''}
    Second timer:     ${second ? '✅' : '⚠️'} ${second ?? ''}
    Third timer:      ${third ? '✅' : '⚠️'} ${third ?? ''}
`

type Names = 'first' | 'second' | 'third'

const exampleStatefulBanner = (setState: (s: string) => void) => {
    // Print the initial banner, e.g. as a placeholder
    setState(printExampleBanner())

    const timestamps: Record<Names, string> = { first: '', second: '', third: '' }
    const timers: Record<Names, NodeJS.Timeout | undefined> = { first: undefined, second: undefined, third: undefined }

    const randomTimeout = (x: keyof typeof timers) =>
        new Promise((resolve) => {
            timers[x] = setTimeout(resolve, Math.floor(Math.random() * 4000) + 1000)
        }).then(() => {
            timestamps[x] = new Date().toISOString()
            setState(printExampleBanner(timestamps))
        })

    // Run the random timeouts in parallel
    Promise.all([randomTimeout('first'), randomTimeout('second'), randomTimeout('third')])

    // Cleanup the timers
    return () => Object.values(timers).forEach(clearTimeout)
}

export async function demo(): Promise<void> {
    const answer = await select({
        message: 'Choose an option',
        choices: [
            {
                name: 'Alpha',
                value: 'alpha',
            },
            {
                name: 'Bravo',
                value: 'bravo',
            },
            new Separator(),
            {
                name: 'Charlie',
                value: 'charlie',
            },
            {
                name: 'Delta',
                value: 'delta',
            },
        ],
        statefulBanner: exampleStatefulBanner,
    })

    console.log(`You chose ${answer}`)
}

// If the --run flag was used, run it immediately
if (process.argv.includes('--run')) {
    await demo()
}
