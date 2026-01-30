import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationEngine } from '../core/ValidationEngine';

describe('ValidationEngine - Strategy Pattern', () => {
  let engine: ValidationEngine;
  let testData: any[];

  beforeEach(() => {
    engine = new ValidationEngine();
    testData = [
      { id: 1, email: 'user1@test.com', price: 100, orderId: 'A1' },
      { id: 2, email: 'user2@test.com', price: 150, orderId: 'A2' },
      { id: 3, email: '', price: 120, orderId: 'A3' },
      { id: 4, email: 'user4@test.com', price: 50000, orderId: 'A4' },
      { id: 5, email: 'user5@test.com', price: 110, orderId: 'A2' },
    ];
  });

  describe('CompletenessStrategy', () => {
    it('should detect missing values', () => {
      const result = engine.validate('Completeness', testData, 'email');
      expect(result.isValid).toBe(false);
      expect(result.failedRows).toContain(2);
      expect(result.message).toContain('missing email values');
    });

    it('should pass when all values are complete', () => {
      const completeData = testData.filter((row) => row.email !== '');
      const result = engine.validate('Completeness', completeData, 'email');
      expect(result.isValid).toBe(true);
      expect(result.failedRows.length).toBe(0);
    });
  });

  describe('NumericalRangeStrategy', () => {
    it('should detect anomalies using z-score', () => {
      const result = engine.validate('NumericalRange', testData, 'price', 1.5);
      expect(result.isValid).toBe(false);
      expect(result.failedRows).toContain(3);
      expect(result.message).toContain('anomalies detected');
    });

    it('should pass when values are within threshold', () => {
      const normalData = [
        { price: 100 },
        { price: 110 },
        { price: 105 },
        { price: 95 },
      ];
      const result = engine.validate('NumericalRange', normalData, 'price', 3);
      expect(result.isValid).toBe(true);
    });
  });

  describe('UniquenessStrategy', () => {
    it('should detect duplicate values', () => {
      const result = engine.validate('Uniqueness', testData, 'orderId');
      expect(result.isValid).toBe(false);
      expect(result.failedRows.length).toBeGreaterThan(0);
      expect(result.message).toContain('duplicate');
    });

    it('should pass when all values are unique', () => {
      const uniqueData = testData.map((row, idx) => ({
        ...row,
        orderId: `UNIQUE-${idx}`,
      }));
      const result = engine.validate('Uniqueness', uniqueData, 'orderId');
      expect(result.isValid).toBe(true);
      expect(result.failedRows.length).toBe(0);
    });
  });

  describe('ValidationEngine', () => {
    it('should register and execute strategies', () => {
      expect(() => engine.validate('Completeness', testData, 'email')).not.toThrow();
      expect(() => engine.validate('NumericalRange', testData, 'price')).not.toThrow();
      expect(() => engine.validate('Uniqueness', testData, 'orderId')).not.toThrow();
    });

    it('should throw error for unknown strategy', () => {
      expect(() => engine.validate('UnknownStrategy', testData, 'email')).toThrow(
        'Unknown validation strategy'
      );
    });

    it('should validate multiple rules using validateAll', () => {
      const config = [
        { strategy: 'Completeness', column: 'email' },
        { strategy: 'Uniqueness', column: 'orderId' },
        { strategy: 'NumericalRange', column: 'price', threshold: 1.5 },
      ];

      const results = engine.validateAll(testData, config);
      expect(results.length).toBe(3);
      expect(results[0].failedRows).toContain(2);
      expect(results[1].isValid).toBe(false);
      expect(results[2].failedRows).toContain(3);
    });
  });
});