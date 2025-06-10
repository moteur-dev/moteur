// src/cli/menu/mainMenu.ts
import inquirer from 'inquirer';
import { showAuthMenu } from './authMenu.js';
import { showProjectsMenu } from './projectsMenu.js';
import { showSystemSettingsMenu } from './systemSettingsMenu.js';
import { showWelcomeBanner } from '../utils/showWelcomeBanner.js';

export async function showMainMenu() {
    try {
        console.clear();
        showWelcomeBanner();

        const { mainChoice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'mainChoice',
                message: 'What would you like to do?',
                choices: [
                    { name: '🔐 Authenticate', value: 'auth' },
                    { name: '📁 View available projects', value: 'projects' },
                    { name: '🛠️  System settings', value: 'settings' },
                    new inquirer.Separator(),
                    { name: '❌ Exit', value: 'exit' }
                ]
            }
        ]);

        switch (mainChoice) {
            case 'auth':
                await showAuthMenu();
                break;
            case 'projects':
                await showProjectsMenu();
                break;
            case 'settings':
                await showSystemSettingsMenu();
                break;
            case 'exit':
                console.log('\n👋 Goodbye!');
                process.exit(0);
        }

        // Loop back to main menu
        await showMainMenu();
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('\n👋 Goodbye!'); // noop; silence this error
        } else {
            console.error('\n❌ Error:', err);
        }
        process.exit(1);
    }
}
