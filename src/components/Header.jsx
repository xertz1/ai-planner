import calendarImage from '../images/calendar-image.png'
import './header.css'

const Header = () => {
    return (
        <section className='header'>
            <div className='header-area'> 
                <img src={calendarImage} alt="calendar" className='calendar-image'/>
                <h3>Smart Planner</h3>
            </div>
        </section>
        
    );
}

export default Header;