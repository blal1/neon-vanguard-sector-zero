// This file is used to set up the test environment for vitest.
// For example, you can import jest-dom matchers here.
import '@testing-library/jest-dom';
import { initializeDataManager } from '../../data/dataManager';
import { beforeAll } from 'vitest';

beforeAll(async () => {
  await initializeDataManager();
});
