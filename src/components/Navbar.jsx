import calendarImage from '../images/calendar-image.png'
import { Link } from 'react-router-dom'
import '../components/navbar.css'
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('User signed out');
            navigate('/')
        } catch(error) {
            console.error('Sign out error: ', error);
        }
    }

    return (
        <section className='navbar'>
            <div className='navbar-area'> 
                <div className='logo-area'>
                    <img src={calendarImage} alt="calendar" className='calendar-image'/>
                     <h3>Smart Planner</h3>
                </div>

                <ul className='nav-links'>
                    <li><Link to='/dashboard'>Dashboard</Link></li>
                    <li><Link to='/settings'>Settings</Link></li>
                    <button className='signout-button' onClick={handleSignOut}>Signout</button>
                </ul>

            </div>
        </section>
    );
};

export default Navbar;