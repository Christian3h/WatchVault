import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import "./styles/global.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/' element={<Dashboard />} /> */}
        <Route path='/login' element={<Login />} />
        {/* <Route path='/config' element={<Config />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
