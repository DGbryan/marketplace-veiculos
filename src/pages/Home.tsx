// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  km: number;
  cidade: string;
  descricao: string;
  revendas: {
    nome: string;
    cidade: string;
  };
};

export default function Home() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtrados, setFiltrados] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    buscarVeiculos();
  }, []);

  useEffect(() => {
    if (busca) {
      setFiltrados(
        veiculos.filter(
          (v) =>
            v.marca.toLowerCase().includes(busca.toLowerCase()) ||
            v.modelo.toLowerCase().includes(busca.toLowerCase()) ||
            v.cidade.toLowerCase().includes(busca.toLowerCase()),
        ),
      );
    } else {
      setFiltrados(veiculos);
    }
  }, [busca, veiculos]);

  async function buscarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*, revendas(nome, cidade)")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
    setFiltrados(data || []);
    setCarregando(false);
  }

  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.heroTitulo}>Veículos disponíveis para revenda</h1>
        <p style={styles.heroSub}>
          Encontre veículos com preço de atacado. Faça login para ver valores e
          entrar em contato.
        </p>
        <input
          type="text"
          placeholder="Buscar por marca, modelo ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.buscaInput}
        />
      </div>

      <div style={styles.main}>
        <div style={styles.topo}>
          <span style={styles.totalTexto}>
            {filtrados.length} veículo{filtrados.length !== 1 ? "s" : ""}{" "}
            disponíve{filtrados.length !== 1 ? "is" : "l"}
          </span>
        </div>

        {carregando ? (
          <p style={styles.mensagem}>Carregando veículos...</p>
        ) : filtrados.length === 0 ? (
          <div style={styles.vazio}>
            <p style={styles.vazioTexto}>Nenhum veículo encontrado</p>
            <p style={styles.vazioSub}>Tente buscar por outro termo.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtrados.map((veiculo) => (
              <div
                key={veiculo.id}
                style={styles.card}
                onClick={() => navigate(`/veiculo-publico/${veiculo.id}`)}
              >
                <div style={styles.fotoPlaceholder}>
                  <span style={styles.fotoTexto}>
                    {veiculo.marca} {veiculo.modelo}
                  </span>
                </div>

                <div style={styles.cardCorpo}>
                  <div style={styles.cardTopo}>
                    <h3 style={styles.cardTitulo}>
                      {veiculo.marca} {veiculo.modelo}
                    </h3>
                    <span style={styles.cardAno}>{veiculo.ano}</span>
                  </div>

                  <div style={styles.cardDetalhes}>
                    <span style={styles.detalhe}>
                      {veiculo.km.toLocaleString("pt-BR")} km
                    </span>
                    <span style={styles.detalhe}>{veiculo.cidade}</span>
                  </div>

                  <div style={styles.precoOculto}>
                    <span style={styles.precoOcultoTexto}>
                      Faça login para ver o preço
                    </span>
                  </div>

                  <div style={styles.cardRodape}>
                    <span style={styles.revenda}>{veiculo.revendas.nome}</span>
                    <span style={styles.verMais}>Ver detalhes →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.banner}>
          <div style={styles.bannerConteudo}>
            <p style={styles.bannerTitulo}>É uma revenda de veículos?</p>
            <p style={styles.bannerSub}>
              Cadastre-se para ver preços, anunciar seus veículos e negociar com
              outras revendas.
            </p>
            <div style={styles.bannerBotoes}>
              <button
                onClick={() => navigate("/cadastro")}
                style={styles.botaoCadastro}
              >
                Cadastrar minha revenda
              </button>
              <button onClick={() => navigate("/")} style={styles.botaoEntrar}>
                Já tenho cadastro — Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    backgroundColor: "#1a1a2e",
    padding: "60px 40px",
    textAlign: "center" as const,
  },
  heroTitulo: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  heroSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "15px",
    marginBottom: "28px",
  },
  buscaInput: {
    width: "100%",
    maxWidth: "500px",
    padding: "13px 18px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    outline: "none",
  },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" },
  topo: { marginBottom: "20px" },
  totalTexto: { fontSize: "14px", color: "#888" },
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
    gap: "20px",
    marginBottom: "48px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  fotoPlaceholder: {
    backgroundColor: "#1a1a2e",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoTexto: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "15px",
  },
  cardCorpo: { padding: "16px" },
  cardTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  cardTitulo: { fontSize: "15px", fontWeight: "600", color: "#1a1a2e" },
  cardAno: {
    fontSize: "12px",
    color: "#888",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardDetalhes: { display: "flex", gap: "8px", marginBottom: "12px" },
  detalhe: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  precoOculto: {
    backgroundColor: "#f0f2f5",
    borderRadius: "6px",
    padding: "10px",
    textAlign: "center" as const,
    marginBottom: "12px",
  },
  precoOcultoTexto: {
    fontSize: "12px",
    color: "#888",
  },
  cardRodape: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid #f0f0f0",
  },
  revenda: { fontSize: "12px", color: "#aaa" },
  verMais: { fontSize: "12px", color: "#1a1a2e", fontWeight: "500" },
  banner: {
    backgroundColor: "#1a1a2e",
    borderRadius: "16px",
    padding: "40px",
    marginTop: "20px",
  },
  bannerConteudo: { textAlign: "center" as const },
  bannerTitulo: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  bannerSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    marginBottom: "24px",
  },
  bannerBotoes: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  botaoCadastro: {
    backgroundColor: "#fff",
    color: "#1a1a2e",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  botaoEntrar: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};
