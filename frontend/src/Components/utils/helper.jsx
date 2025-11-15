export const authenticate = (data, next) => {
    if (window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            id: data.user._id
        }));
    }
    next();
};

export const getUser = () => {
    if (window !== 'undefined') {
        if (localStorage.getItem('user')) {
            return JSON.parse(localStorage.getItem('user'));
        } else {
            return false;
        }
    }
};

export const getToken = () => {
    if (window !== 'undefined') {
        return localStorage.getItem('token');
    }
};

export const isAdmin = () => {
    const user = getUser();
    return user && user.role === 'admin';
};

export const isAuthenticated = () => {
    return getToken() !== null;
};

export const logout = (next) => {
    if (window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    if (next && typeof next === 'function') {
        next();
    }
};