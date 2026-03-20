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
    <div style={styles.container}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgePonto} />
          Marketplace B2B de Veículos
        </div>
        <h1 style={styles.heroTitulo}>
          Compre e venda veículos
          <br />
          com preço de atacado
        </h1>
        <p style={styles.heroSub}>
          Plataforma exclusiva para revendas. Faça login para ver preços e
          negociar diretamente.
        </p>
        <div style={styles.heroBusca}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle
              cx="6.5"
              cy="6.5"
              r="5"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
            />
            <path
              d="M11 11L14 14"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por marca, modelo ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.heroBuscaInput}
          />
        </div>
        <div style={styles.heroBotoes}>
          <button onClick={() => navigate("/")} style={styles.botaoPrimario}>
            Entrar como revenda
          </button>
          <button
            onClick={() => navigate("/cadastro")}
            style={styles.botaoSecundario}
          >
            Cadastrar minha revenda →
          </button>
        </div>
      </div>

      {/* Catálogo */}
      <div style={styles.catalogo}>
        <div style={styles.catalogoHeader}>
          <div>
            <h2 style={styles.catalogoTitulo}>Veículos disponíveis</h2>
            <p style={styles.catalogoSub}>
              Faça login para ver preços e entrar em contato
            </p>
          </div>
          <span style={styles.catalogoContador}>
            {filtrados.length} veículo{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {carregando ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Carregando veículos...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Nenhum veículo encontrado</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtrados.map((veiculo) => (
              <div
                key={veiculo.id}
                style={styles.card}
                onClick={() => navigate(`/veiculo-publico/${veiculo.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#1E1E1E";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#1A1A1A";
                }}
              >
                <div style={styles.cardFoto}>
                  <span style={styles.cardFotoTexto}>
                    {veiculo.marca} {veiculo.modelo}
                  </span>
                </div>

                <div style={styles.cardCorpo}>
                  <div style={styles.cardHeader}>
                    <div>
                      <p style={styles.cardMarca}>{veiculo.marca}</p>
                      <p style={styles.cardModelo}>{veiculo.modelo}</p>
                    </div>
                    <span style={styles.cardAno}>{veiculo.ano}</span>
                  </div>

                  <div style={styles.cardTags}>
                    <span style={styles.tag}>
                      {veiculo.km.toLocaleString("pt-BR")} km
                    </span>
                    <span style={styles.tag}>{veiculo.cidade}</span>
                  </div>

                  <div style={styles.precoOculto}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle
                        cx="6"
                        cy="6"
                        r="5"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M6 4V6.5M6 8H6.01"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span style={styles.precoOcultoTexto}>
                      Login para ver o preço
                    </span>
                  </div>

                  <div style={styles.cardRodape}>
                    <span style={styles.cardRevenda}>
                      {veiculo.revendas.nome}
                    </span>
                    <span style={styles.cardLink}>Ver detalhes →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner CTA */}
      <div style={styles.cta}>
        <div style={styles.ctaConteudo}>
          <div style={styles.ctaTextos}>
            <p style={styles.ctaBadge}>Para revendas</p>
            <h2 style={styles.ctaTitulo}>Sua revenda no RevCar</h2>
            <p style={styles.ctaSub}>
              Acesse preços de atacado, anuncie seu estoque e negocie com outras
              revendas em todo o Brasil.
            </p>
          </div>
          <div style={styles.ctaBotoes}>
            <button
              onClick={() => navigate("/cadastro")}
              style={styles.botaoPrimario}
            >
              Cadastrar gratuitamente
            </button>
            <button
              onClick={() => navigate("/")}
              style={styles.botaoSecundario}
            >
              Já tenho cadastro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
  },
  hero: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "80px 24px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "20px",
  },
  heroBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(91,106,208,0.1)",
    border: "1px solid rgba(91,106,208,0.2)",
    borderRadius: "99px",
    padding: "5px 14px",
    fontSize: "12px",
    color: "#8B96E9",
    fontWeight: "500",
  },
  heroBadgePonto: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#5B6AD0",
    display: "inline-block",
  },
  heroTitulo: {
    fontSize: "44px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  heroSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    lineHeight: 1.6,
    maxWidth: "480px",
  },
  heroBusca: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px 16px",
    width: "100%",
    maxWidth: "480px",
  },
  heroBuscaInput: {
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    flex: 1,
  },
  heroBotoes: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  botaoPrimario: {
    backgroundColor: "#5B6AD0",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  botaoSecundario: {
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  catalogo: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px 60px",
  },
  catalogoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  catalogoTitulo: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: "0 0 4px",
  },
  catalogoSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
  },
  catalogoContador: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "4px 12px",
    borderRadius: "99px",
  },
  estado: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
  },
  estadoTexto: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "14px",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  card: {
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  cardFoto: {
    height: "160px",
    backgroundColor: "#141414",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  cardFotoTexto: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.1)",
  },
  cardCorpo: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMarca: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  cardModelo: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: "2px 0 0",
  },
  cardAno: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardTags: {
    display: "flex",
    gap: "6px",
  },
  tag: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  precoOculto: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "6px",
    padding: "8px 10px",
  },
  precoOcultoTexto: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
  },
  cardRodape: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  cardRevenda: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
  },
  cardLink: {
    fontSize: "11px",
    color: "#5B6AD0",
    fontWeight: "500",
  },
  cta: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#111111",
    padding: "60px 24px",
  },
  ctaConteudo: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  ctaTextos: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  ctaBadge: {
    fontSize: "11px",
    color: "#5B6AD0",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: 0,
  },
  ctaTitulo: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  ctaSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    lineHeight: 1.6,
    maxWidth: "400px",
  },
  ctaBotoes: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
    flexWrap: "wrap",
  },
};
