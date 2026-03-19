// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  {
    path: "/catalogo",
    label: "Catálogo",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    path: "/painel",
    label: "Meus anúncios",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="14"
          height="3"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="6.5"
          width="14"
          height="3"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="12"
          width="14"
          height="3"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    path: "/chat",
    label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M14 8C14 11.3137 11.3137 14 8 14C6.8 14 5.68 13.64 4.75 13.02L2 14L2.98 11.25C2.36 10.32 2 9.2 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: "/perfil",
    label: "Meu perfil",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 14C2 11.2386 4.68629 9 8 9C11.3137 9 14 11.2386 14 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function getIniciais(email: string): string {
  if (!email) return "R";
  const partes = email.split("@")[0].split(/[._-]/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const iniciais = getIniciais(usuario?.email || "");

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcone}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect width="18" height="18" rx="5" fill="#5B6AD0" />
            <path
              d="M5 9L7.5 11.5L13 6.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p style={styles.logoNome}>RevCar</p>
          <p style={styles.logoBadge}>B2B Marketplace</p>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Avatar da revenda */}
      <div style={styles.revendaArea}>
        <div style={styles.avatar}>{iniciais}</div>
        <div style={styles.revendaInfo}>
          <p style={styles.revendaLabel}>Revenda ativa</p>
          <p style={styles.revendaEmail}>{usuario?.email}</p>
        </div>
        <div style={styles.statusDot} />
      </div>

      <div style={styles.divider} />

      {/* Navegação */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemAtivo : {}),
            })}
          >
            <span style={styles.navIcone}>{item.icon}</span>
            <span style={styles.navTexto}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Rodapé */}
      <div style={styles.rodape}>
        <div style={styles.divider} />
        <button onClick={handleLogout} style={styles.botaoSair}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M6 2H3C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H6M10 10.5L13 7.5M13 7.5L10 4.5M13 7.5H6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#111111",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "20px 16px 18px",
  },
  logoIcone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoNome: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
    lineHeight: 1.3,
  },
  logoBadge: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "10px",
    margin: 0,
    lineHeight: 1.3,
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
    margin: "0",
  },
  revendaArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#5B6AD0",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  revendaInfo: {
    flex: 1,
    overflow: "hidden",
  },
  revendaLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    margin: 0,
    lineHeight: 1.4,
  },
  revendaEmail: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4ADE80",
    flexShrink: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 10px",
    gap: "1px",
    flex: 1,
  },
  navLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "4px 8px 8px",
    margin: 0,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "7px 10px",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    fontSize: "13.5px",
    transition: "all 0.1s",
  },
  navItemAtivo: {
    backgroundColor: "rgba(91,106,208,0.15)",
    color: "#8B96E9",
  },
  navIcone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navTexto: {
    lineHeight: 1,
  },
  rodape: {
    marginTop: "auto",
  },
  botaoSair: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "12px 18px",
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left",
  },
};
