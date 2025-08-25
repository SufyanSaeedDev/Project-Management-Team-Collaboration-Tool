export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    return formatDate(date);
};

export const isDueSoon = (dueDate: string | Date): boolean => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 24;
};

export const isOverdue = (dueDate: string | Date): boolean => {
    return new Date(dueDate) < new Date();
};
