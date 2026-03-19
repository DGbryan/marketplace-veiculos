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

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
  },
  conteudo: {
    flex: 1,
    overflow: "auto",
    backgroundColor: "#0F0F0F",
  },
};
