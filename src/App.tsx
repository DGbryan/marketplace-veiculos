// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import CRMLayout from "./components/CRMLayout";
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
                <CRMLayout>
                  <Painel />
                </CRMLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/catalogo"
            element={
              <PrivateRoute role="revenda">
                <CRMLayout>
                  <Catalogo />
                </CRMLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/veiculo/:id"
            element={
              <PrivateRoute role="revenda">
                <CRMLayout>
                  <Detalhe />
                </CRMLayout>
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
