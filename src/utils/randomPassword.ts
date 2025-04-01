export const generateRandomPassword = (): string => {
    const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
};