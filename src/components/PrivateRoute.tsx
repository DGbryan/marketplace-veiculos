// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  role?: "admin" | "revenda";
};

export default function PrivateRoute({ children, role }: Props) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={styles.container}>
        <p style={styles.texto}>Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (role && usuario.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    fontSize: "16px",
    color: "#888",
  },
};
