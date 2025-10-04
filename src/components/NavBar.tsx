import { NavLink } from 'react-router-dom';
import { ActionBar, type AppAction } from './ActionBar';
import '../styles/nav.css';

export function NavBar() {
  const items: Array<{ to: string; label: string }> = [
    { to: '/',         label: 'Home' },
    { to: '/chat',     label: 'Chat' },
    { to: '/prompts',  label: 'Prompts' },
    { to: '/regex',    label: 'Regex' },
    { to: '/agents',   label: 'Agents' },
    { to: '/batch',    label: 'Batch' },
    { to: '/history',  label: 'Histórico' },
    { to: '/config',   label: 'Config' },
  ];

  // Reuso do ActionBar para estilizar; cada botão é um NavLink
  const actions: AppAction[] = items.map((it) => ({
    id: it.to,
    label: (
      <NavLink
        to={it.to}
        className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
      >
        {it.label}
      </NavLink>
    ) as any,
    variant: 'secondary', // a cor ativa vem do .navlink.active
  }));

  return (
    <div className="navbar">
      <div className="navbar-brand">11 PromptLab</div>
      <ActionBar actions={actions} onAction={() => { /* navegação é do NavLink */ }} align="left" />
    </div>
  );
}
