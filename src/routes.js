import AboutPage from './pages/AboutPage.jsx';
import ContactSuccessPage from './pages/ContactSuccessPage.jsx';
import DataPage from './pages/DataPage.jsx';
import GamerProfilePage from './pages/GamerProfilePage.jsx';
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SecurityPage from './pages/SecurityPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SteamCallbackPage from './pages/SteamCallbackPage.jsx';
import SupportPage from './pages/SupportPage.jsx';

export const routes = {
  '/': HomePage,
  '/index.html': HomePage,
  '/jogo': GamePage,
  '/perfil-gamer': GamerProfilePage,
  '/auth/steam/callback': SteamCallbackPage,
  '/sobre-nos': AboutPage,
  '/sobre-nos.html': AboutPage,
  '/dados': DataPage,
  '/dados.html': DataPage,
  '/seguranca': SecurityPage,
  '/seguranca.html': SecurityPage,
  '/suporte': SupportPage,
  '/suporte.html': SupportPage,
  '/contato-enviado': ContactSuccessPage,
  '/contato-enviado.html': ContactSuccessPage,
  '/login': LoginPage,
  '/login.html': LoginPage,
  '/signup': SignupPage,
  '/signup.html': SignupPage,
};
