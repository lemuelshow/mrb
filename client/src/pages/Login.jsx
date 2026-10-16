import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname ?? '/carteira';
  if (user) return <Navigate to={destination} replace />;

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.login, form.password, form.remember);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <section className="login__promo dotted">
        <Logo inverted size="lg" />

        <div className="login__pitch">
          <span className="pill pill--promo">PROMOÇÕES EXCLUSIVAS</span>
          <h1 className="login__title">Cada compra vira bônus na sua carteira.</h1>
          <p className="login__lead">
            Acumule cashback, ative cupons das promoções MRB e acompanhe tudo em um só lugar.
          </p>
          <ul className="login__perks" aria-label="Vantagens do clube">
            <li>
              <Icon name="coin" size={16} /> Cashback
            </li>
            <li>
              <Icon name="gift" size={16} /> Cupons
            </li>
            <li>
              <Icon name="wallet" size={16} /> Carteira
            </li>
          </ul>
        </div>

        <div className="login__preview" aria-hidden="true">
          <div className="preview-card">
            <div className="preview-card__row">
              <span className="eyebrow">SALDO DE BÔNUS</span>
              <Icon name="wallet" size={20} className="text-accent" />
            </div>
            <span className="preview-card__value">R$ 128,40</span>
            <span className="text-success">+ R$ 12,00 nesta semana</span>
          </div>
          <div className="preview-card preview-card--inline">
            <span className="discount-tile">-20%</span>
            <span>
              <strong>Cupom de boas-vindas</strong>
              <span className="text-muted">Válido na primeira compra</span>
            </span>
          </div>
        </div>
      </section>

      <section className="login__form-panel">
        <div className="login__form-wrap">
          <header className="stack-sm">
            <h2 className="heading-lg">Entrar na sua conta</h2>
            <p className="text-muted">Use seu e-mail ou CPF cadastrado no programa MRB Fidelidade.</p>
          </header>

          <form className="stack-md" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert--error" role="alert">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="login">E-mail ou CPF</label>
              <div className="field__control">
                <Icon name="mail" />
                <input
                  id="login"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="voce@email.com"
                  value={form.login}
                  onChange={update('login')}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Senha</label>
              <div className="field__control">
                <Icon name="lock" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={form.password}
                  onChange={update('password')}
                  required
                />
                <button
                  type="button"
                  className="icon-button icon-button--plain"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                </button>
              </div>
            </div>

            <div className="login__options">
              <label className="checkbox">
                <input type="checkbox" checked={form.remember} onChange={update('remember')} />
                Manter conectado
              </label>
              <a href="#recuperar-senha" className="link-strong">
                Esqueci minha senha
              </a>
            </div>

            <button type="submit" className="button button--primary button--lg" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
              {!submitting && <Icon name="arrowRight" />}
            </button>
          </form>

          {import.meta.env.DEV && (
            <p className="login__demo">
              Acesso de demonstração: <strong>mariana@mrb.com.br</strong> / <strong>123456</strong>
            </p>
          )}

          <p className="login__signup">
            Ainda não participa? <a href="#cadastro" className="link-strong">Cadastre-se e ganhe 20%</a>
          </p>
        </div>
      </section>
    </div>
  );
}
