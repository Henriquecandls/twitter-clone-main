import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;