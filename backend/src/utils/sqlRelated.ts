

export const escapeLike = (str: string) => str.replace(/[%_]/g, '\\$&'); //escape % and _ , which are wildcards that would return everythingexport const sanitizeSearchQuery = (query?: string) => {
    

export const sanitizeSearchQuery = (query?: string) => {
    if (!query) return undefined;

    const trimmed = query.trim();
    if (trimmed.length === 0) return undefined;

    //  truncate long queries  
    return trimmed.slice(0, 100);
};

