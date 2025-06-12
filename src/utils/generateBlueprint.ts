import fs from 'fs/promises';
import path from 'path';
import { readJson, writeJson } from '../utils/fileUtils';


export interface GenerateBlueprintOptions {
  blueprintId: string;
  projectId: string;
  targetModelId?: string;
  includeEntry?: boolean;
}

export async function generateBlueprint(opts: GenerateBlueprintOptions): Promise<void> {
  const blueprintPath = path.join('plugins/blueprints', opts.blueprintId);
  const modelPath = path.join(blueprintPath, 'model.json');
  const entryPath = path.join(blueprintPath, 'entry-seed.json');

  // Load model
  let model = await readJson(modelPath);
  // Write model to project
  const modelId = opts.targetModelId || model.type;
  const modelOutPath = path.join('data/projects', opts.projectId, 'models', `${modelId}.json`);
  await fs.mkdir(path.dirname(modelOutPath), { recursive: true });
  await writeJson(modelOutPath, model);

  // Optionally write entry
  if (opts.includeEntry) {
    try {
      const entry = await readJson(entryPath);
      const entryOutPath = path.join('data/projects', opts.projectId, 'entries', modelId, 'welcome.json');
      await fs.mkdir(path.dirname(entryOutPath), { recursive: true });
      await writeJson(entryOutPath, entry);
    } catch (_) {
      // No seed entry, continue
    }
  }

  console.log(`✅ Blueprint '${opts.blueprintId}' applied to project '${opts.projectId}'`);
}

