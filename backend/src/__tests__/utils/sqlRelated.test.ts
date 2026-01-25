import { describe, it, expect } from '@jest/globals';
import * as sqlRelated from '../../utils/sqlRelated.js';


// -- Escape String Utility ----
describe('escapeLike Utility', () => {
  
  const escapeScenarios = [
    {
      description: "standard percent sign",
      input: "100%",
      expected: "100\\%"
    },
    {
      description: "standard underscore",
      input: "user_name",
      expected: "user\\_name"
    },
    {
      description: "both wildcards combined",
      input: "50%_discount",
      expected: "50\\%\\_discount"
    },
    {
      description: "multiple occurrences of wildcards",
      input: "a%b%c_d_e",
      expected: "a\\%b\\%c\\_d\\_e"
    },
    {
      description: "normal text without wildcards",
      input: "SIT Assessment 2026",
      expected: "SIT Assessment 2026"
    },
    {
      description: "empty string",
      input: "",
      expected: ""
    },
    //edge cases
    {
        description: "escapes wildcards alongside emojis",
        input: "100%_😊",
        expected: "100\\%\\_😊"
      },
      {
        description: "escapes wildcards inside non-Latin scripts",
        input: "搜索%_项",
        expected: "搜索\\%\\_项"
      }
  ];

  it.each(escapeScenarios)(
    'should correctly handle $description', 
    ({ input, expected }) => {
      const result = sqlRelated.escapeLike(input);
      expect(result).toBe(expected);
    }
  );
});


describe('sanitizeSearchQuery Utility', () => {
  
    const searchScenarios = [
        {
        description: "standard valid query",
        input: "Lim Vi Shean",
        expected: "Lim Vi Shean"
        },
        {
        description: "query with leading and trailing whitespace",
        input: "   sit assessment   ",
        expected: "sit assessment"
        },
        {
        description: "undefined input",
        input: undefined,
        expected: undefined
        },
        {
        description: "empty string",
        input: "",
        expected: undefined
        },
        {
        description: "whitespace-only string",
        input: "     ",
        expected: undefined
        },
        // edge cases
        {
        description: "extremely long query (truncation check)",
        input: "a".repeat(150),
        expected: "a".repeat(100)
        },
        {
        description: "Unicode emojis",
        input: "  search 😊  ",
        expected: "search 😊"
        },
        {
            description: "International characters (Chinese/Tamil)",
            input: "  你好 / வணக்கம்  ",
            expected: "你好 / வணக்கம்"
        },
        {
            description: "Accented characters",
            input: "  Lím Vi Shéan  ",
            expected: "Lím Vi Shéan"
        },
    ];

    it.each(searchScenarios)(
        'should handle $description', 
        ({ input, expected }) => {
        const result = sqlRelated.sanitizeSearchQuery(input);
        expect(result).toBe(expected);
        }
    );
});


