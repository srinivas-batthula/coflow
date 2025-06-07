import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { Toaster } from "react-hot-toast";

export const viewport = {
  themeColor: "rgba(0, 76, 255, 0.562)",
};

export const metadata = {
  title: "CoFlow",
  description: "A-Z Hackathon Team management platform",
  authors: [{ name: "Srinivas Batthula" }, { name: "Akash Kyadari" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Manifest.json.... */}
        {/* <link rel="manifest" href="https://verseify.netlify.app/manifest.json" /> */}

        {/* Icon...     */}
        {/* <link rel="icon" href="https://verseify.netlify.app/verseify.png" type="image/x-icon" /> */}
      </head>
      <body>
        <Layout>{children}</Layout>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#333",
              borderRadius: "10px",
              padding: "14px 20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "#22c55e", // Tailwind green-500
                secondary: "#fff",
              },
              style: {
                background: "#ecfdf5", // green-50
                color: "#15803d", // green-700
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444", // red-500
                secondary: "#fff",
              },
              style: {
                background: "#fef2f2", // red-50
                color: "#991b1b", // red-800
              },
            },
          }}
        />
      </body>
    </html>
  );
}
