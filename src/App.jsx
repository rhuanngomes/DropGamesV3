import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import DataPage from './pages/DataPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import ContactSuccessPage from './pages/ContactSuccessPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

const routes = {
  '/': HomePage,
  '/index.html': HomePage,
  '/sobre-nos': AboutPage,
  '/sobre-nos.html': AboutPage,
  '/dados': DataPage,
  '/dados.html': DataPage,
  '/suporte': SupportPage,
  '/suporte.html': SupportPage,
  '/contato-enviado': ContactSuccessPage,
  '/contato-enviado.html': ContactSuccessPage,
  '/login': LoginPage,
  '/login.html': LoginPage,
  '/signup': SignupPage,
  '/signup.html': SignupPage,
};

export default function App() {
  const Page = routes[window.location.pathname] || HomePage;
  return <Page />;
}
