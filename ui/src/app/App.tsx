import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-optivault-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-optivault-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  );
}