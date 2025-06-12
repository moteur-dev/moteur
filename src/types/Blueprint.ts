export interface Blueprint {
  id: string;
  label: string;
  description?: string;

  type: 'model' | 'layout' | 'template' | 'structure' | 'page';
  path: string; // relative path to blueprint folder
  icon?: string;

  seedPath?: string;        // optional
}