export interface GenerateLibSchema {
  name: string;
  type: 'feature' | 'data-access' | 'ui' | 'model' | 'util';
  scope: 'frontend' | 'backend';
  directory?: string;
}
