// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Painel from "./pages/Painel";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
