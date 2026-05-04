import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ChessBoard from "./components/ChessBoard";
import ModeSelect from "./ModeSelect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/game" element={<ModeSelect />} />
        
        <Route path="/game/multi" element={<ChessBoard mode="multi" />} />
        <Route path="/game/ai" element={<ChessBoard mode="ai" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;