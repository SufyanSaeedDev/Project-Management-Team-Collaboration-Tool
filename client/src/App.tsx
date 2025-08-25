import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from './hooks';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AppLayout from './components/layout/AppLayout';
import WorkspacesPage from './features/workspaces/pages/WorkspacesPage';
import ProjectBoardPage from './features/board/pages/ProjectBoardPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import ClientPortalPage from './features/client-portal/pages/ClientPortalPage';

const AuthCallback = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.location.href = '/dashboard';
    }
    return <div>Processing...</div>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/portal/:clientToken" element={<ClientPortalPage />} />
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workspaces" element={<WorkspacesPage />} />
                    <Route path="workspaces/new" element={<WorkspacesPage />} />
                    <Route path="projects/:projectId" element={<ProjectBoardPage />} />
                </Route>
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1>404 Not Found</h1></div>} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from './hooks';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AppLayout from './components/layout/AppLayout';
import WorkspacesPage from './features/workspaces/pages/WorkspacesPage';
import ProjectBoardPage from './features/board/pages/ProjectBoardPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import ClientPortalPage from './features/client-portal/pages/ClientPortalPage';

// Auth callback handler for OAuth
const AuthCallback = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.location.href = '/dashboard';
    }

    return <div>Processing authentication...</div>;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Client Portal (public, no auth required) */}
                <Route path="/portal/:clientToken" element={<ClientPortalPage />} />

                {/* Protected routes with layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workspaces" element={<WorkspacesPage />} />
                    <Route path="workspaces/new" element={<WorkspacesPage />} />
                    <Route path="projects/:projectId" element={<ProjectBoardPage />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from './hooks';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AppLayout from './components/layout/AppLayout';
import WorkspacesPage from './features/workspaces/pages/WorkspacesPage';
import ProjectBoardPage from './features/board/pages/ProjectBoardPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import ClientPortalPage from './features/client-portal/pages/ClientPortalPage';

// Auth callback handler for OAuth
const AuthCallback = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.location.href = '/dashboard';
    }

    return <div>Processing authentication...</div>;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Client Portal (public, no auth required) */}
                <Route path="/portal/:clientToken" element={<ClientPortalPage />} />

                {/* Protected routes with layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workspaces" element={<WorkspacesPage />} />
                    <Route path="workspaces/new" element={<WorkspacesPage />} />
                    <Route path="projects/:projectId" element={<ProjectBoardPage />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import AppLayout from './components/layout/AppLayout';
import WorkspacesPage from './features/workspaces/pages/WorkspacesPage';
import ProjectBoardPage from './features/board/pages/ProjectBoardPage';
import Dashboard from './features/dashboard/pages/Dashboard';
localStorage.setItem('accessToken', accessToken);
window.location.href = '/dashboard';
    }

return <div>Processing authentication...</div>;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes with layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workspaces" element={<WorkspacesPage />} />
                <Route path="workspaces/new" element={<WorkspacesPage />} />
                <Route path="projects/:projectId" element={<ProjectBoardPage />} />
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>} />
        </Routes>
    );
}

export default App;

export default App;
