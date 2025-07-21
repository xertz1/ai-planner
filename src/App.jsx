import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Footer from './components/Footer';
import Header from './components/Header';
import NavBar from './components/Navbar'


function Layout() {
    const location = useLocation(); 
    const isLoginPage = location.pathname === '/' || location.pathname === '/signup';
    return (
        <>
            {isLoginPage ? <Header /> : <NavBar />}
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/settings' element={<Settings />} />
            </Routes>
            <Footer/>
        </>

    );

};

function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}

export default App;
