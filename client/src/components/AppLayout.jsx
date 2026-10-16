import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { initials } from '../utils/format.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const links = [
  { to: '/carteira', label: 'Minha carteira' },
  { to: '/promocoes', label: 'Promoções' },
  { to: '/cupons', label: 'Meus cupons' }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  function handleSearch(event) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get('q')?.toString().trim();
    navigate(q ? `/promocoes?q=${encodeURIComponent(q)}` : '/promocoes');
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner container">
          <Link to="/carteira" className="topbar__brand" aria-label="MRB Clube de Benefícios, início">
            <Logo />
          </Link>

          <button
            type="button"
            className="icon-button topbar__toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>

          <div id="menu-principal" className={`topbar__menu${menuOpen ? ' is-open' : ''}`}>
            <nav aria-label="Principal" className="topbar__nav">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className="navlink">
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <form className="search search--compact" role="search" onSubmit={handleSearch}>
              <label htmlFor="busca-topo" className="sr-only">
                Buscar promoções
              </label>
              <Icon name="search" size={16} />
              <input id="busca-topo" name="q" type="search" placeholder="Buscar promoções" />
            </form>

            <div className="topbar__user">
              <span className="avatar" aria-hidden="true">
                {initials(user?.name)}
              </span>
              <span className="topbar__user-name">{user?.name}</span>
              <button type="button" className="icon-button" aria-label="Sair" onClick={handleLogout}>
                <Icon name="logout" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container page">
        <Outlet />
      </main>
    </div>
  );
}
