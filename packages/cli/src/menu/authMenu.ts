import inquirer from 'inquirer';
import { loginUser } from '@moteur/core/auth.js';
import fs from 'fs';
import path from 'path';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

const TOKEN_FILE = path.resolve(
    process.env.HOME || process.env.USERPROFILE || '.',
    '.moteur-cli-token.json'
);

export async function showAuthMenu() {
    console.clear();
    console.log('\n🔐 Authentication');

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an authentication action:',
            choices: [
                { name: '🔑 Log in', value: 'login' },
                { name: '🚪 Log out', value: 'logout' },
                { name: '👤 Create user', value: 'create-user' },
                { name: '👥 List users (admin)', value: 'list-users' },
                new inquirer.Separator(),
                { name: '⬅️ Back to main menu', value: 'back' }
            ]
        }
    ]);

    switch (action) {
        case 'login':
            await handleLogin();
            break;
        case 'logout':
            if (fs.existsSync(TOKEN_FILE)) {
                fs.unlinkSync(TOKEN_FILE);
            }
            console.log('\n✅ You have been logged out.');
            break;
        case 'create-user':
            await cliRegistry.get('auth', 'create-user').action({});
            break;
        case 'list-users':
            try {
                await cliRegistry.get('auth', 'list').action({});
            } catch (err) {
                console.error('\n❌', err instanceof Error ? err.message : String(err));
            }
            break;
        case 'back':
        default:
            return;
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press enter to return to the menu' }
    ]);
    await showAuthMenu();
}

async function handleLogin() {
    const { email, password } = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:', mask: '*' }
    ]);

    try {
        const { token } = await loginUser(email, password);
        fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2));
        console.log(`\n✅ Logged in as ${email}`);
    } catch (err) {
        console.log('\n❌ Login failed:', err instanceof Error ? err.message : String(err));
    }
}
