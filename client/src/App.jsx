import { BrowserRouter, Routes, Route } from "react-router-dom";

// Componentes fixos
import Header from "./components/header";
import Footer from "./components/footer";

// Páginas
import Home from "./pages/home";
import Login from "./pages/login";
import Perfil from "./pages/perfil";
import Cart from "./pages/cart";
import Inventory from "./pages/inventory";
import ProductForm from "./pages/productForm";
import ProductDetails from "./pages/productDetails";
import UsersList from "./pages/usersList";
import FormUsuario from "./pages/formUsuario";
import EditUsuario from "./pages/editUsuario";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users/new" element={<FormUsuario />} />

        {/* Autenticados */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/cart" element={<Cart />} />

        {/* Funcionario / Dono */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />

        {/* Dono */}
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/:id/edit" element={<EditUsuario />} />
      </Routes>

    </BrowserRouter>
  );
}
