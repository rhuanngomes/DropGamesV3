import HomePage from './pages/HomePage.jsx';
import { routes } from './routes.js';

export default function App() {
  const Page = routes[window.location.pathname] || HomePage;
  return <Page />;
}
