'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [otp, setOtp] = useState('');
  useEffect(() => {
    const storedData = localStorage.getItem('otp');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (otp === data.otp) {
      const success = await signup(data.fullName, data.email, data.password);
      if (success) {
        localStorage.removeItem('otp');
        window.location.href = '/'; //Enables full page reload
      } else {
        setError('Error while Creating New User!');
      }
    } else {
      setError('Invalid OTP/Timed Out!');
    }
    setLoading(false);
    // error is handled by zustand store and shown below
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4 py-8">
      {/* Top-left Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-5 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold shadow hover:bg-purple-200 transition-all duration-150 z-10 cursor-pointer"
        type="button"
      >
        ← Back
      </button>
      <div className="w-full max-w-5xl h-[650px] flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out">
        <div className="w-full h-full flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg flex flex-col justify-center h-full transition-opacity duration-700 ease-in-out"
          >
            <h2
              className="text-2xl font-bold mb-6 text-purple-700 text-center"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              OTP
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Enter OTP: </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                required
              />
            </div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Next'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
