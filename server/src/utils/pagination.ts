export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const getPagination = (query: PaginationQuery): {
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
} => {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const offset = (page - 1) * limit;

    return {
        limit,
        offset,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc',
    };
};

export const getPaginatedResponse = <T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> => {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
