import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as progressStore from '../../services/progressStore.js';

describe('ProgressStore Service', () => {
    const jobId = 'test-job-123';

    beforeEach(() => {
        // use fake timers to test clearProgressLater without waiting 5 seconds
        jest.useFakeTimers();
        progressStore.setProgress(jobId, 0); 
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('setProgress and getProgress', () => {
        const progressScenarios = [
            { desc: 'standard progress', input: 50, expected: 50 },
            { desc: 'clamping at 100%', input: 150, expected: 100 },
            { desc: 'clamping at 0%', input: -20, expected: 0 },
            { desc: 'rounding/decimal handling', input: 45.6, expected: 45.6 },
            {desc: 'exact upper boundary (100)',input:100, expected: 100},
            {desc: 'exact lower boundary (0)',input:0, expected: 0}

        ];

        it.each(progressScenarios)('should handle $desc', ({ input, expected }) => {
            progressStore.setProgress(jobId, input);
            expect(progressStore.getProgress(jobId)).toBe(expected);
        });

        it('should return 0 for a non-existent jobId', () => {
            expect(progressStore.getProgress('ghost-id')).toBe(0);
        });
    });
    describe('edge cases', () => {
        it('should return 0 if jobId is undefined', () => {
            expect(progressStore.getProgress(undefined as unknown as string)).toBe(0);
        });

        it('should handle undefined jobId in clearProgressLater', () => {
            // This ensures the setTimeout branch is covered even with junk input
            progressStore.clearProgressLater('non-existent', 100);
            jest.advanceTimersByTime(100);
            expect(progressStore.getProgress('non-existent')).toBe(0);
        });
        it('should use the default delay of 5000ms when delayMs is not provided', () => {
            progressStore.setProgress(jobId, 100);
            
            progressStore.clearProgressLater(jobId); 
            
            jest.advanceTimersByTime(4999);
            expect(progressStore.getProgress(jobId)).toBe(100);

            jest.advanceTimersByTime(1);
            expect(progressStore.getProgress(jobId)).toBe(0);
        });
        it('should use the specified delay of when delayMs is provided', () => {
            progressStore.setProgress(jobId, 100);
            
            progressStore.clearProgressLater(jobId, 1000); 
            
            jest.advanceTimersByTime(999);
            expect(progressStore.getProgress(jobId)).toBe(100);

            jest.advanceTimersByTime(1);
            expect(progressStore.getProgress(jobId)).toBe(0);
        });

    });
    describe('clearProgressLater', () => {
        it('should delete the progress after the specified delay', () => {
            progressStore.setProgress(jobId, 100);
            
            progressStore.clearProgressLater(jobId, 5000);
            
            expect(progressStore.getProgress(jobId)).toBe(100);
            //advance time
            jest.advanceTimersByTime(5000);

            expect(progressStore.getProgress(jobId)).toBe(0);
        });
    });
});