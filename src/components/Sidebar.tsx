// src/components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { path: "/catalogo", label: "Catalogo", icone: "▦" },
  { path: "/painel", label: "Meus anuncios", icone: "▤" },
  { path: "/chat", label: "Chat", icone: "▣" },
  { path: "/perfil", label: "Meu perfil", icone: "▥" },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoTexto}>RevCar</span>
        <span style={styles.logoBadge}>B2B</span>
      </div>

      <div style={styles.revendaBox}>
        <span style={styles.revendaLabel}>Revenda logada</span>
        <span style={styles.revendaEmail}>{usuario?.email}</span>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemAtivo : {}),
            })}
          >
            <span style={styles.navIcone}>{item.icone}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={styles.botaoSair}>
        Sair
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#1a1a2e",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "24px 20px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  logoTexto: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "700",
  },
  logoBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "10px",
    padding: "2px 7px",
    borderRadius: "4px",
    fontWeight: "500",
  },
  revendaBox: {
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "3px",
  },
  revendaLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  revendaEmail: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.65)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    padding: "12px 10px",
    gap: "2px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    fontSize: "14px",
  },
  navItemAtivo: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  navIcone: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center" as const,
  },
  botaoSair: {
    margin: "12px",
    padding: "10px",
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.35)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
};
