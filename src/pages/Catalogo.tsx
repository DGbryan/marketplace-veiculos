// src/pages/Catalogo.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cidade: string;
  descricao: string;
  revendas: {
    nome: string;
    telefone: string;
  };
};

export default function Catalogo() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtrados, setFiltrados] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [marca, setMarca] = useState("");
  const [cidade, setCidade] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    buscarVeiculos();
  }, []);

  useEffect(() => {
    filtrar();
  }, [marca, cidade, precoMax, veiculos]);

  async function buscarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*, revendas(nome, telefone)")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
    setFiltrados(data || []);
    setCarregando(false);
  }

  function filtrar() {
    let resultado = [...veiculos];

    if (marca) {
      resultado = resultado.filter((v) =>
        v.marca.toLowerCase().includes(marca.toLowerCase()),
      );
    }

    if (cidade) {
      resultado = resultado.filter((v) =>
        v.cidade.toLowerCase().includes(cidade.toLowerCase()),
      );
    }

    if (precoMax) {
      resultado = resultado.filter((v) => v.preco <= parseFloat(precoMax));
    }

    setFiltrados(resultado);
  }

  function limparFiltros() {
    setMarca("");
    setCidade("");
    setPrecoMax("");
  }

  function abrirWhatsApp(telefone: string, veiculo: Veiculo) {
    const mensagem = `Olá! Vi o anúncio do ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} por R$ ${veiculo.preco.toLocaleString("pt-BR")} no RevCar. Tenho interesse!`;
    const numero = telefone.replace(/\D/g, "");
    window.open(
      `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitulo}>RevCar</h1>
        <div style={styles.headerAcoes}>
          <button
            onClick={() => navigate("/painel")}
            style={styles.botaoSecundario}
          >
            Meus anúncios
          </button>
          <button onClick={handleLogout} style={styles.botaoLogout}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.topo}>
          <h2 style={styles.titulo}>Catálogo de veículos</h2>
          <span style={styles.badge}>
            {filtrados.length} veículo{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={styles.filtros}>
          <input
            type="text"
            placeholder="Filtrar por marca..."
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={styles.filtroInput}
          />
          <input
            type="text"
            placeholder="Filtrar por cidade..."
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            style={styles.filtroInput}
          />
          <input
            type="number"
            placeholder="Preço máximo (R$)..."
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            style={styles.filtroInput}
          />
          {(marca || cidade || precoMax) && (
            <button onClick={limparFiltros} style={styles.botaoLimpar}>
              Limpar filtros
            </button>
          )}
        </div>

        {carregando ? (
          <p style={styles.mensagem}>Carregando veículos...</p>
        ) : filtrados.length === 0 ? (
          <div style={styles.vazio}>
            <p style={styles.vazioTexto}>Nenhum veículo encontrado</p>
            <p style={styles.vazioSub}>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtrados.map((veiculo) => (
              <div
                key={veiculo.id}
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => navigate(`/veiculo/${veiculo.id}`)}
              >
                <div style={styles.cardTopo}>
                  <h3 style={styles.cardTitulo}>
                    {veiculo.marca} {veiculo.modelo}
                  </h3>
                  <span style={styles.cardAno}>{veiculo.ano}</span>
                </div>

                <div style={styles.cardPreco}>
                  R$ {veiculo.preco.toLocaleString("pt-BR")}
                </div>

                <div style={styles.cardDetalhes}>
                  <span style={styles.detalhe}>
                    {veiculo.km.toLocaleString("pt-BR")} km
                  </span>
                  <span style={styles.detalhe}>{veiculo.cidade}</span>
                </div>

                {veiculo.descricao && (
                  <p style={styles.descricao}>{veiculo.descricao}</p>
                )}

                <div style={styles.cardRodape}>
                  <span style={styles.revenda}>{veiculo.revendas.nome}</span>
                  <button
                    onClick={() =>
                      abrirWhatsApp(veiculo.revendas.telefone, veiculo)
                    }
                    style={styles.botaoWhatsApp}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitulo: { color: "#fff", fontSize: "18px", fontWeight: "600" },
  headerAcoes: { display: "flex", gap: "12px", alignItems: "center" },
  botaoSecundario: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  botaoLogout: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" },
  topo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  titulo: { fontSize: "20px", fontWeight: "600", color: "#1a1a2e" },
  badge: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "99px",
  },
  filtros: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  filtroInput: {
    padding: "9px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#fff",
    minWidth: "200px",
  },
  botaoLimpar: {
    padding: "9px 16px",
    backgroundColor: "transparent",
    color: "#e53e3e",
    border: "1px solid #e53e3e",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  mensagem: { color: "#888", textAlign: "center" as const },
  vazio: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  vazioTexto: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "6px",
  },
  vazioSub: { fontSize: "13px", color: "#888" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  cardTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitulo: { fontSize: "15px", fontWeight: "600", color: "#1a1a2e" },
  cardAno: {
    fontSize: "12px",
    color: "#888",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardPreco: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2d7a3a",
  },
  cardDetalhes: { display: "flex", gap: "8px" },
  detalhe: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  descricao: {
    fontSize: "12px",
    color: "#888",
    lineHeight: "1.5",
  },
  cardRodape: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    paddingTop: "10px",
    borderTop: "1px solid #f0f0f0",
  },
  revenda: { fontSize: "12px", color: "#888" },
  botaoWhatsApp: {
    backgroundColor: "#25D366",
    color: "#fff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
};
