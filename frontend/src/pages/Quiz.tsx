import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ProfileQuiz } from "@/components/quiz/ProfileQuiz";
import { useUser } from "@/context/UserContext";

const Quiz = () => {
  const { isAuthenticated, profile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (profile) {
      navigate("/recommendations");
    }
  }, [isAuthenticated, profile, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProfileQuiz />
    </div>
  );
};

export default Quiz;
