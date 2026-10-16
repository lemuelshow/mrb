import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth.jsx';
import AppLayout from './components/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Carteira from './pages/Carteira.jsx';
import Promocoes from './pages/Promocoes.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/promocoes" element={<Promocoes />} />
        <Route path="/cupons" element={<Promocoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/carteira" replace />} />
    </Routes>
  );
}
