// src/pages/Painel.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  status: string;
  created_at: string;
};

const schema = z.object({
  marca: z.string().min(2, "Informe a marca"),
  modelo: z.string().min(2, "Informe o modelo"),
  ano: z.string().min(4, "Informe o ano"),
  preco: z.string().min(1, "Informe o preço"),
  km: z.string().min(1, "Informe a quilometragem"),
  cidade: z.string().min(2, "Informe a cidade"),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Painel() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (usuario?.revenda_id) buscarVeiculos();
  }, [usuario]);

  async function buscarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .eq("revenda_id", usuario?.revenda_id)
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
    setCarregando(false);
  }

  async function onSubmit(data: FormData) {
    setSalvando(true);
    setErro("");

    const { error } = await supabase.from("veiculos").insert({
      revenda_id: usuario?.revenda_id,
      marca: data.marca,
      modelo: data.modelo,
      ano: parseInt(data.ano),
      preco: parseFloat(data.preco),
      km: parseInt(data.km),
      cidade: data.cidade,
      descricao: data.descricao || "",
      status: "ativo",
    });

    if (error) {
      setErro("Erro ao cadastrar veículo. Tente novamente.");
      setSalvando(false);
      return;
    }

    reset();
    setMostrarForm(false);
    buscarVeiculos();
    setSalvando(false);
  }

  async function encerrarAnuncio(id: string) {
    await supabase.from("veiculos").update({ status: "vendido" }).eq("id", id);

    setVeiculos((prev) => prev.filter((v) => v.id !== id));
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
          <button onClick={() => setMostrarForm(true)} style={styles.botaoNovo}>
            + Anunciar veículo
          </button>
          <button onClick={handleLogout} style={styles.botaoLogout}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {mostrarForm && (
          <div style={styles.formCard}>
            <div style={styles.formTopo}>
              <h2 style={styles.formTitulo}>Novo anúncio</h2>
              <button
                onClick={() => setMostrarForm(false)}
                style={styles.botaoFechar}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              <div style={styles.grid2}>
                <div style={styles.campo}>
                  <label style={styles.label}>Marca</label>
                  <input
                    {...register("marca")}
                    placeholder="Ex: Toyota"
                    style={styles.input}
                  />
                  {errors.marca && (
                    <span style={styles.erro}>{errors.marca.message}</span>
                  )}
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Modelo</label>
                  <input
                    {...register("modelo")}
                    placeholder="Ex: Corolla"
                    style={styles.input}
                  />
                  {errors.modelo && (
                    <span style={styles.erro}>{errors.modelo.message}</span>
                  )}
                </div>
              </div>

              <div style={styles.grid3}>
                <div style={styles.campo}>
                  <label style={styles.label}>Ano</label>
                  <input
                    {...register("ano")}
                    placeholder="Ex: 2020"
                    style={styles.input}
                  />
                  {errors.ano && (
                    <span style={styles.erro}>{errors.ano.message}</span>
                  )}
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Preço (R$)</label>
                  <input
                    {...register("preco")}
                    placeholder="Ex: 85000"
                    style={styles.input}
                  />
                  {errors.preco && (
                    <span style={styles.erro}>{errors.preco.message}</span>
                  )}
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Quilometragem</label>
                  <input
                    {...register("km")}
                    placeholder="Ex: 45000"
                    style={styles.input}
                  />
                  {errors.km && (
                    <span style={styles.erro}>{errors.km.message}</span>
                  )}
                </div>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Cidade</label>
                <input
                  {...register("cidade")}
                  placeholder="Ex: Florianópolis"
                  style={styles.input}
                />
                {errors.cidade && (
                  <span style={styles.erro}>{errors.cidade.message}</span>
                )}
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Descrição (opcional)</label>
                <textarea
                  {...register("descricao")}
                  placeholder="Detalhes adicionais sobre o veículo..."
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              {erro && <p style={styles.erroGeral}>{erro}</p>}

              <div style={styles.formBotoes}>
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  style={styles.botaoCancelar}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  style={styles.botaoSalvar}
                >
                  {salvando ? "Salvando..." : "Publicar anúncio"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.topo}>
          <h2 style={styles.titulo}>Meus anúncios</h2>
          <span style={styles.badge}>
            {veiculos.length} ativo{veiculos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {carregando ? (
          <p style={styles.mensagem}>Carregando...</p>
        ) : veiculos.length === 0 ? (
          <div style={styles.vazio}>
            <p style={styles.vazioTexto}>Nenhum anúncio ainda</p>
            <p style={styles.vazioSub}>
              Clique em "Anunciar veículo" para começar.
            </p>
          </div>
        ) : (
          <div style={styles.lista}>
            {veiculos.map((veiculo) => (
              <div key={veiculo.id} style={styles.card}>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitulo}>
                    {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                  </h3>
                  <div style={styles.cardDetalhes}>
                    <span style={styles.preco}>
                      R$ {veiculo.preco.toLocaleString("pt-BR")}
                    </span>
                    <span style={styles.detalhe}>
                      {veiculo.km.toLocaleString("pt-BR")} km
                    </span>
                    <span style={styles.detalhe}>{veiculo.cidade}</span>
                  </div>
                  {veiculo.descricao && (
                    <p style={styles.descricao}>{veiculo.descricao}</p>
                  )}
                </div>
                <button
                  onClick={() => encerrarAnuncio(veiculo.id)}
                  style={styles.botaoEncerrar}
                >
                  Encerrar
                </button>
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
  botaoNovo: {
    backgroundColor: "#fff",
    color: "#1a1a2e",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
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
  main: { maxWidth: "860px", margin: "0 auto", padding: "32px 20px" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  formTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  formTitulo: { fontSize: "16px", fontWeight: "600", color: "#1a1a2e" },
  botaoFechar: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#888",
  },
  form: { display: "flex", flexDirection: "column" as const, gap: "14px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  campo: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#333" },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none",
  },
  textarea: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none",
    resize: "vertical" as const,
    fontFamily: "sans-serif",
  },
  erro: { fontSize: "11px", color: "#e53e3e" },
  erroGeral: {
    fontSize: "13px",
    color: "#e53e3e",
    backgroundColor: "#fff5f5",
    padding: "8px",
    borderRadius: "6px",
    textAlign: "center" as const,
  },
  formBotoes: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  botaoCancelar: {
    padding: "9px 20px",
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  botaoSalvar: {
    padding: "9px 20px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
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
  lista: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardInfo: { flex: 1 },
  cardTitulo: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  cardDetalhes: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "6px",
  },
  preco: { fontSize: "15px", fontWeight: "600", color: "#2d7a3a" },
  detalhe: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  descricao: { fontSize: "12px", color: "#888", marginTop: "4px" },
  botaoEncerrar: {
    backgroundColor: "#fff",
    color: "#e53e3e",
    border: "1px solid #e53e3e",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
};
