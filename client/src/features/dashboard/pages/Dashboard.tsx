import React from 'react';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
    // Mock data - would come from API in real implementation
    const stats = [
        { label: 'Total Tasks', value: '24', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'In Progress', value: '8', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Completed', value: '16', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Team Members', value: '5', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const recentProjects = [
        { name: 'Website Redesign', tasks: 12, color: '#3B82F6' },
        { name: 'Mobile App', tasks: 8, color: '#10B981' },
        { name: 'Marketing Campaign', tasks: 5, color: '#F59E0B' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of your projects and tasks</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-base">
                        <div className="flex items-center">
                            <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Projects */}
            <div className="card-base">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
                <div className="space-y-4">
                    {recentProjects.map((project) => (
                        <div key={project.name} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                />
                                <span className="font-medium text-gray-900">{project.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">{project.tasks} tasks</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card-base">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
                        <Plus className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="font-medium text-gray-700">Create Project</span>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
                        <Users className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="font-medium text-gray-700">Invite Team</span>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
                        <CheckCircle className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="font-medium text-gray-700">View Tasks</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

// Helper component
const Plus = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
