import fs from 'fs';
import path from 'path';
import { 
    moveToTrash, 
    restoreFromTrash, 
    deleteTrashedItem 
} from '../../../src/utils/trashUtils';

const tmpBase = path.join('tmp-test');
const sourceFile = path.join(tmpBase, 'test.txt');
const trashFile = path.join(tmpBase, '.trash', 'test.txt');
const restoreFile = path.join(tmpBase, 'restored.txt');

beforeEach(() => {
  // Clean up any previous test data
  fs.rmSync(tmpBase, { recursive: true, force: true });

  // Recreate test file
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  fs.writeFileSync(sourceFile, 'Hello, world!', 'utf-8');
});

afterAll(() => {
  fs.rmSync(tmpBase, { recursive: true, force: true });
});

describe('trashUtils', () => {
  it('moves a file to the trash', () => {
    moveToTrash(sourceFile, trashFile);
    expect(fs.existsSync(sourceFile)).toBe(false);
    expect(fs.existsSync(trashFile)).toBe(true);
    expect(fs.readFileSync(trashFile, 'utf-8')).toBe('Hello, world!');
  });

  it('restores a file from the trash', () => {
    moveToTrash(sourceFile, trashFile);
    restoreFromTrash(trashFile, restoreFile);
    expect(fs.existsSync(trashFile)).toBe(false);
    expect(fs.existsSync(restoreFile)).toBe(true);
    expect(fs.readFileSync(restoreFile, 'utf-8')).toBe('Hello, world!');
  });

  it('deletes a trashed file permanently', () => {
    moveToTrash(sourceFile, trashFile);
    deleteTrashedItem(trashFile);
    expect(fs.existsSync(trashFile)).toBe(false);
  });

  it('does nothing if trashed file does not exist', () => {
    expect(() => deleteTrashedItem(trashFile)).not.toThrow();
  });
});
