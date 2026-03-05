import inquirer from 'inquirer';
import { listLayouts } from '@moteur/core/layouts.js';
import { showLayoutMenu } from './layoutMenu.js';
import { showModelSchemasMenu } from './modelsMenu.js';
import { patchProjectCommand, patchProjectJSONCommand } from '../commands/projects.js';
import { showWelcomeBanner } from '../utils/showWelcomeBanner.js';
import { User } from '@moteur/types/User.js';
import { cliLoadUser } from '../utils/auth.js';

export async function showProjectMenu(projectId: string) {
    const user: User = cliLoadUser();
    try {
        showWelcomeBanner();
        console.log(`\n🔧 Project Context: ${projectId}`);

        const { projectChoice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'projectChoice',
                message: 'Choose an action for this project:',
                choices: [
                    { name: '📄 View layouts', value: 'layouts' },
                    { name: '📁 View structures', value: 'structures' },
                    { name: '📦 View models', value: 'models' },
                    new inquirer.Separator(),
                    { name: '🛠️ Edit project settings (Interactive)', value: 'settings' },
                    { name: '📝 Edit project settings (JSON)', value: 'settings-json' },
                    new inquirer.Separator(),
                    { name: '⬅️ Back to projects', value: 'back' }
                ]
            }
        ]);

        switch (projectChoice) {
            case 'layouts': {
                const layouts = await listLayouts(user, projectId);

                const choices = layouts.map(p => ({ name: p.label, value: p.id }));
                choices.push(
                    { name: '➕ Create new layout', value: '__create' },
                    { name: '🔙 Back', value: '__back' }
                );

                const { selectedLayout } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectedLayout',
                        message: 'Select a layout:',
                        choices
                    }
                ]);
                await showLayoutMenu({ projectId, layoutId: selectedLayout });

                break;
            }
            case 'structures': {
                /*const structures = await listStructures(projectId);
        console.log('\n📁 Structures:');
        structures.forEach((structure) => {
            console.log(`- ${structure.type}: ${structure.label || '(no label)'}`);
        });*/
                break;
            }
            case 'models':
                await showModelSchemasMenu(projectId); // <== Go to the model menu
                break;
            case 'settings': {
                await patchProjectCommand({ id: projectId });
                break;
            }
            case 'settings-json': {
                await patchProjectJSONCommand({ projectId });
                break;
            }

            case 'back':
                return;
        }

        console.log('\n');
        await inquirer.prompt([
            { type: 'input', name: 'continue', message: 'Press Enter to return to project menu...' }
        ]);
        await showProjectMenu(projectId);
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('\n👋 Goodbye!'); // noop; silence this error
        } else {
            console.error('\n❌ Error:', err);
        }
        process.exit(1);
    }
}
