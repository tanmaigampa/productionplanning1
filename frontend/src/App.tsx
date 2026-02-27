import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AgricultureModule from './modules/agriculture/AgricultureModule';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f1117]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agriculture" element={<AgricultureModule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
