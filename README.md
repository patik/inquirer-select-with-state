# inquirer-select-with-state

Inquirer select prompt with a stateful banner

A fork of [inquirer's](https://github.com/SBoudrias/Inquirer.js) built-in `select` command line prompt, but with the ability to add a stateful banner above the list of choices.

![](https://github.com/user-attachments/assets/a77b4eaa-f1a1-4a89-83ab-30ecea57110e)

You provide a `statefulBanner` function. This function receives a `setState` function which can be called at will. The string sent to `setState` is shown above the select prompt. `statefulBanner` can also return a cleanup function.

## Install

```sh
pnpm add inquirer-select-with-state
yarn add inquirer-select-with-state
npm add inquirer-select-with-state
```

## Usage

```tsx
import select from 'inquirer-select-with-state'

const answer = await select({
    message: 'Choose an option',
    choices: [
        { name: '1', value: '1' },
        { name: '2', value: '2' },
        { name: '3', value: '3' },
    ],
    statefulBanner: (setState: (s: string) => void) => {
        setState('Directory size: loading...')
        exec('du -sh', (err, stdout) => {
            if (!err) {
                setState(`Directory size: ${stdout}`)
            }
        })
    },
})
```

The prompt will initially look like this:

```tsx
Directory size: loading...
? Choose an option
❯ 1
  2
  3
```

A moment later, it will automatically update:

```tsx
Directory size: 123M
? Choose an option
❯ 1
  2
  3
```

### Return value

If your banner has any side effects (e.g. timeouts), you can return a cleanup function which will be called when the prompt quits.
