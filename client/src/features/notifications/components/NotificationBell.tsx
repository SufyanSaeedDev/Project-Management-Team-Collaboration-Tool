import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);

    // Mock notifications
    const notifications = [
        {
            id: 1,
            title: 'Task Assigned',
            message: 'John assigned you to "Website Redesign"',
            time: '5m ago',
            read: false,
        },
        {
            id: 2,
            title: 'Comment Added',
            message: 'Sarah commented on "Mobile App"',
            time: '1h ago',
            read: false,
        },
        {
            id: 3,
            title: 'Due Soon',
            message: '"Marketing Campaign" is due tomorrow',
            time: '2h ago',
            read: false,
        },
    ];

    const handleMarkAsRead = () => {
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20 border max-h-96 overflow-y-auto">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAsRead}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {notification.time}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {notifications.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p>No notifications</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
