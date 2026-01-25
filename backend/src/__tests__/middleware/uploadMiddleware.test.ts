import { describe, it, expect } from '@jest/globals';
import * as uploadMiddleware from '../../middleware/uploadMiddleware.js'; 

describe('Upload Middleware Utility', () => {
    const fileScenarios = [
        // --- Valid Scenarios ---
        {
            description: "standard .csv with text/csv mime",
            input: { name: "data.csv", mime: "text/csv" },
            expected: true
        },
        {
            description: "excel-style .csv mime",
            input: { name: "export.csv", mime: "application/vnd.ms-excel" },
            expected: true
        },
        {
            description: "csv with application/csv mime",
            input: { name: "report.csv", mime: "application/csv" },
            expected: true
        },
        {
            description: "csv with text/comma-separated-values mime",
            input: { name: "report.csv", mime: "text/comma-separated-values" },
            expected: true
        },
        {
            description: "csv with uppercase extension",
            input: { name: "DATA.CSV", mime: "text/csv" },
            expected: true
        },
        
        {
            description: "mixed case extension with application/csv",
            input: { name: "Report.Csv", mime: "application/csv" },
            expected: true
        },
        // --- Invalid Extension Scenarios ---
        {
            description: "correct mime but wrong extension (.txt)",
            input: { name: "data.txt", mime: "text/csv" },
            expected: false
        },
        {
            description: "dangerous double extension (.csv.exe)",
            input: { name: "malware.csv.exe", mime: "text/csv" },
            expected: false
        },
        {
            description: "no extension at all",
            input: { name: "filename", mime: "text/csv" },
            expected: false
        },

        // --- Invalid Mime Scenarios ---
        {
            description: "correct extension but wrong mime (json)",
            input: { name: "data.csv", mime: "application/json" },
            expected: false
        },
        {
            description: "executable disguised as csv",
            input: { name: "virus.csv", mime: "application/x-msdownload" },
            expected: false
        },

        // --- Edge Cases ---
        {
            description: "missing filename/mime",
            input: { name: "", mime: "" },
            expected: false
        },
    ];

    it.each(fileScenarios)(
        'should return $expected for $description',
        ({ input, expected }) => {
            const result = uploadMiddleware.validateFile(input.name, input.mime);
            expect(result).toBe(expected);
        }
    );

})