import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import { LogOut, Menu, X } from 'lucide-react';

const AppLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative w-64 bg-white shadow-lg h-full z-50`}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary-600">TaskFlow</h2>
                </div>
                <nav className="mt-8 px-4 space-y-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg">
                        Dashboard
                    </Link>
                    <Link to="/workspaces" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg">
                        Workspaces
                    </Link>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                                {user?.fullName?.[0] || 'U'}
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between md:justify-end">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import { Settings, LogOut, Plus, Menu, X } from 'lucide-react';

const AppLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative w-64 bg-white shadow-lg transition-all duration-300 h-full z-50`}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary-600">TaskFlow</h2>
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/workspaces" className="block px-4 py-2 text-gray-700 hover:bg-primary-50 rounded-lg transition-colors">
                        Workspaces
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                                {user?.fullName?.[0] || 'U'}
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-gray-900">{user?.fullName || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between md:justify-end">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout } from '../auth/authSlice';
import NotificationBell from '../../features/notifications/components/NotificationBell';
Settings,
    LogOut,
    Plus,
    Menu,
    X,
} from 'lucide-react';

const AppLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b">
                        <h1 className="text-xl font-bold text-primary-600">TaskFlow</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Dashboard
                        </Link>
                        <Link
                            to="/workspaces"
                            className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <FolderKanban className="h-5 w-5 mr-3" />
                            Workspaces
                        </Link>
                        <Link
                            to="/team"
                            className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Users className="h-5 w-5 mr-3" />
                            Team
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Settings className="h-5 w-5 mr-3" />
                            Settings
                        </Link>
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t">
                        <div className="flex items-center mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1 lg:flex-none lg:w-64" />
                        <div className="flex items-center space-x-4">
                            {/* Add workspace button */}
                            <Link
                                to="/workspaces/new"
                                className="btn-primary flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">New Workspace</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
