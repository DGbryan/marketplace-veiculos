// src/components/CRMLayout.tsx
import Sidebar from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function CRMLayout({ children }: Props) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.conteudo}>{children}</main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  conteudo: {
    flex: 1,
    overflow: "auto",
  },
};
