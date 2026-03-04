import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { loginUser } from '@moteur/core/auth.js';
import {
    createUser,
    listUsers,
    getProjectUsers,
    getDisplayProjectIds
} from '@moteur/core/users.js';
import { loadProjects } from '@moteur/core/projects.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { showAuthMenu } from '../menu/authMenu.js';
import { cliRequireRole } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';

const TOKEN_FILE = path.resolve(
    process.env.HOME || process.env.USERPROFILE || '.',
    '.moteur-cli-token.json'
);

export async function loginCommand(): Promise<void> {
    const { email } = await inquirer.prompt([{ type: 'input', name: 'email', message: 'Email:' }]);

    const { password } = await inquirer.prompt([
        { type: 'password', name: 'password', message: 'Password:' }
    ]);

    try {
        const { token } = await loginUser(email, password);
        fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2));
        console.log('✅ Login successful! Token saved.');
    } catch (err) {
        console.error(`❌ Login failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
    }
}

export async function logoutCommand(): Promise<void> {
    if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
        console.log('✅ Logout successful! Token removed.');
    } else {
        console.log('⚠️ No active session found. Nothing to log out.');
    }
}

export async function createUserCommand(): Promise<void> {
    const { email, password } = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Email:' },
        { type: 'password', name: 'password', message: 'Password:', mask: '*' }
    ]);

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        id: email.split('@')[0], // Just a quick default ID
        isActive: true,
        email,
        passwordHash,
        roles: ['admin'], // Or empty array if you prefer
        projects: [] // No projects assigned by default
    };

    try {
        createUser(user);
        console.log(`✅ User "${email}" created successfully!`);
    } catch (err) {
        console.error(
            `❌ Failed to create user: ${err instanceof Error ? err.message : String(err)}`
        );
        process.exit(1);
    }
}

/** Strip sensitive fields for list output (CLI and JSON). */
function sanitizeUserForList(u: User): Omit<User, 'passwordHash'> & { passwordHash?: never } {
    const { passwordHash: _, ...rest } = u;
    return rest;
}

export async function listUsersCommand(args: {
    json?: boolean;
    quiet?: boolean;
    project?: string;
}): Promise<void> {
    cliRequireRole('admin');

    const users = args.project ? getProjectUsers(args.project) : listUsers();

    const safe = users.map(sanitizeUserForList);

    if (args.json) {
        return console.log(JSON.stringify(safe, null, 2));
    }
    if (args.quiet) return;

    if (safe.length === 0) {
        console.log(
            args.project ? `👤 No users found for project "${args.project}".` : '👤 No users found.'
        );
        return;
    }

    const existingProjectIds = loadProjects().map(p => p.id);
    console.log('👤 Users:');
    for (const u of safe) {
        const roles = (u.roles ?? []).join(', ') || '—';
        const projects = getDisplayProjectIds(u, existingProjectIds).join(', ') || '—';
        console.log(
            `  ${u.id} | ${u.email} | active: ${u.isActive} | roles: ${roles} | projects: ${projects}`
        );
    }
}

cliRegistry.register('auth', {
    name: '',
    description: 'Interactive auth menu',
    action: async () => {
        await showAuthMenu();
    }
});

// Register each subcommand:
cliRegistry.register('auth', {
    name: 'login',
    description: 'Log in and save JWT token',
    action: loginCommand
});

cliRegistry.register('auth', {
    name: 'logout',
    description: 'Log out and remove JWT token',
    action: logoutCommand
});

cliRegistry.register('auth', {
    name: 'create-user',
    description: 'Create a new user',
    action: createUserCommand
});

cliRegistry.register('auth', {
    name: 'list',
    description: 'List all users and their roles/permissions (admin only)',
    action: listUsersCommand
});
