// src/App.tsx
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [status, setStatus] = useState("Conectando...");

  useEffect(() => {
    supabase
      .from("revendas")
      .select("count")
      .then(({ error }) => {
        if (error) setStatus("Erro: " + error.message);
        else setStatus("Banco conectado com sucesso!");
      });
  }, []);

  return <h1>{status}</h1>;
}

export default App;
