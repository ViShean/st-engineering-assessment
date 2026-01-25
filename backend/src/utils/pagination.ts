
export const calculatePagination = (page: number, limit: number, totalCount: number) => {
    // page handling
    const safePage = Math.max(1, Number.isFinite(page) ? page : 1);

    // limit handling
    let safeLimit = limit;
    if (limit === 0) safeLimit = 10;
    else if (limit < 0) safeLimit = 1;
    else safeLimit = Math.min(100, limit);

    const offset = (safePage - 1) * safeLimit;

    // calculating total pages
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safeLimit);

    return { safePage, safeLimit, offset, totalPages };
};
