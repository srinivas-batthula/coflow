import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { Toaster } from 'react-hot-toast';

export const viewport = {
  themeColor: '#320398',
};

export const metadata = {
  title: 'CoFlow',
  description: 'A-Z Hackathon Team management Productivity platform',
  authors: [{ name: 'Srinivas Batthula' }, { name: 'Akash Kyadari' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Manifest.json.... */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icon...     */}
        <link rel="icon" href="/icon.png" type="image/x-icon" />

        {/* <!-- Open Graph Meta Tags --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://coflow.netlify.app" />
        <meta
          property="og:title"
          content="Check out this exciting hackathon opportunity  ~CoFlow"
        />
        <meta
          property="og:description"
          content="Find your next challenge, collaborate with your team, and showcase your innovation. For more opportunities, Visit at { https://coflow.netlify.app }"
        />
        <meta property="og:image" content="https://coflow.netlify.app/icon.png" />

        {/* <!-- Twitter Card Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://coflow.netlify.app" />
        <meta
          name="twitter:title"
          content="Check out this exciting hackathon opportunity  ~CoFlow"
        />
        <meta
          name="twitter:description"
          content="Find your next challenge, collaborate with your team, and showcase your innovation. For more opportunities, Visit at { https://coflow.netlify.app }"
        />
        <meta name="twitter:image" content="https://coflow.netlify.app/icon.png" />

        {/* FontAwesome icons... */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Layout>{children}</Layout>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '10px',
              padding: '14px 20px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: '#22c55e', // Tailwind green-500
                secondary: '#fff',
              },
              style: {
                background: '#ecfdf5', // green-50
                color: '#15803d', // green-700
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#fff',
              },
              style: {
                background: '#fef2f2', // red-50
                color: '#991b1b', // red-800
              },
            },
          }}
        />
      </body>
    </html>
  );
}
