import '@/styles/globals.css'
import Layout from '@/components/Layout'



export const viewport = {
    themeColor: "rgba(0, 76, 255, 0.562)",
}

export const metadata = {
    title: 'HackPilot',
    description: 'A-Z Hackathon Team management platform',
    authors: [{ name: 'Srinivas Batthula' }, { name: "Akash Kyadari" }],
}


export default async function RootLayout({ children }) {

    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="rgba(0, 76, 255, 0.562)" />

                <link
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
                    rel="stylesheet"
                />
            </head>

            <body >
                {/* Main content of your application */}
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    );
}
