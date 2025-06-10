import { storageRegistry } from '../registry/StorageRegistry.js';
import { readFileSync } from 'fs';
import { projectFilePath } from './pathUtils.js';  

export function getProjectStorage(projectId: string) {
  const projectPath = projectFilePath(projectId);

  let projectConfig: any;
  try {
    const data = readFileSync(projectPath, 'utf-8');
    projectConfig = JSON.parse(data);
  } catch (err) {
    // fallback to global local storage
    return storageRegistry.create('local', {
        baseDir: `./data/${projectId}`,
        listMode: 'directory',
    });
  }

  const storageId = projectConfig.storage || 'local';
  const storageOptions = projectConfig.storageOptions || {
        baseDir: `./data/${projectId}`,
        listMode: 'directory',
  };

  return storageRegistry.create(storageId, storageOptions);
}
