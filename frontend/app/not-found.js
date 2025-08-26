'use client'; // Required for client-side navigation

import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <html>
            <body className="w-full flex items-center justify-center h-screen bg-gray-100 text-gray-800">
                <div className="text-center px-1 py-2 bg-white shadow-md rounded-lg">
                    <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
                    <p className="mb-6 text-gray-600">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition cursor-pointer"
                    >
                        Go to Homepage
                    </button>
                </div>
            </body>
        </html>
    );
}
