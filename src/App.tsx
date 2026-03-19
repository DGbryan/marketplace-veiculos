// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Painel from "./pages/Painel";
import Admin from "./pages/Admin";
import Catalogo from "./pages/Catalogo";
import Detalhe from "./pages/Detalhe";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/painel"
            element={
              <PrivateRoute role="revenda">
                <Painel />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalogo"
            element={
              <PrivateRoute role="revenda">
                <Catalogo />
              </PrivateRoute>
            }
          />
          <Route
            path="/veiculo/:id"
            element={
              <PrivateRoute role="revenda">
                <Detalhe />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
