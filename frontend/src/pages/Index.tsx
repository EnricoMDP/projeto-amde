
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona automaticamente para a tela de login
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Index;
