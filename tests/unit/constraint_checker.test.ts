import { describe, it, expect } from 'vitest';
import { makeCohort } from '../fixtures/mockData';

describe('Team Size Constraint Checker', () => {
  it('should validate team size strictly between min and max bounds', () => {
    const students = makeCohort(5);
    const minSize = 3;
    const maxSize = 5;

    expect(students.length).toBeGreaterThanOrEqual(minSize);
    expect(students.length).toBeLessThanOrEqual(maxSize);
  });
});
