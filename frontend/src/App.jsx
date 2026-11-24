import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import MainDashboard from "./Pages/MainDashboard";
import Dashboard from "./Pages/Dashboard";
import Leads from "./Pages/Leads";
import HR from "./Pages/Hr";
import Finance from "./Pages/Finance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<MainDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/hr" element={<HR />} />
        <Route path="/finance" element={<Finance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
