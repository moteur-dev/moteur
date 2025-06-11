import { BlockSchema } from '../types/Block.js';
import { loadBlocks as loaderLoadBlocks } from '../loaders/loadBlocks';
//import { htmlRenderer } from '../renderers/html/htmlBlockRenderer';
import { isValidId } from '../utils/idUtils';
import { isExistingProjectId } from '../utils/fileUtils';

/*const rendererMap: Record<string, any> = {
    html: htmlRenderer
};*/

export function listBlocks(project?: string): Record<string, BlockSchema> {
    return loaderLoadBlocks();
}

export function getBlock(type: string, project?: string): BlockSchema {
    if (project && !isValidId(project)) {
        throw new Error(`Invalid project ID: ${project}`);
    }
    if (project && !isExistingProjectId(project as string)) {
        throw new Error(`Project "${project}" does not exist`);
    }
    const blocks = listBlocks(project);
    if (!blocks[type]) {
        throw new Error(`Block type "${type}" not found`);
    }
    return blocks[type];
}
