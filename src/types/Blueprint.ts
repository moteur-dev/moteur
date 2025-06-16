export interface BaseBlueprint {
    id: string;
    label: string;
    description?: string;
    //icon?: string;
    path: string;
    type: 'model' | 'layout' | 'template' | 'structure' | 'page' | 'project';
}

export interface ModelBlueprint extends BaseBlueprint {
    type: 'model';
    seedPath?: string;
    //formStructure?: string;
}

export interface ProjectBlueprint extends BaseBlueprint {
    type: 'project';
    models?: string[];
    layouts?: string[];
    templates?: string[];
    structures?: string[];
    entries?: string[];
}

export interface LayoutBlueprint extends BaseBlueprint {
    type: 'layout';
    layoutPath: string;
}
