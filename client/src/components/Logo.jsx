import logoUrl from '../assets/mrb-logo.png';

// Sobre fundo colorido (inverted) a logo vai num selo branco para manter o contraste.
export default function Logo({ inverted = false, size = 'md' }) {
  return (
    <span className={`logo logo--${size}${inverted ? ' logo--inverted' : ''}`}>
      <img src={logoUrl} alt="MRB Clube de Benefícios" className="logo__img" />
    </span>
  );
}
