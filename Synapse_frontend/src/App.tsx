import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import RegisterPage from "./Register";
import LoginPage from "./Login";
import ProfilePage from "./Profile";

const App = () => {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
};

export default App;
