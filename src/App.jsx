import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
