import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateDecision from './pages/CreateDecision';
import Decisions from "./pages/Decisions";
import EditDecision from "./pages/EditDecision";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<CreateDecision />} />

        <Route path="/decisions" element={<Decisions />} />

        <Route path="/edit/:id" element={<EditDecision />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;