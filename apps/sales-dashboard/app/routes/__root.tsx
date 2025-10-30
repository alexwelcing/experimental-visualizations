import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Providers } from '~/lib/providers'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sales Dashboard</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f5f5f5;
          }
        `}</style>
      </head>
      <body>
        <Providers>
          <div style={{ minHeight: '100vh' }}>
            <nav style={{
              background: '#1e293b',
              color: 'white',
              padding: '1rem 2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                📊 Sales Dashboard
              </h1>
            </nav>
            <main>
              <Outlet />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
