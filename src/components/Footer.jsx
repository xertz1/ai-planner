import './Footer.css'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-section">
                    <h3 className="title">Contacts</h3>
                    <p>
                        <span className="circle-icon">
                            <FaEnvelope className="icon" />
                        </span>
                        <span className='em'>kpirathe@uwo.ca</span>
                    </p>
                    <p>
                        <span className="circle-icon">
                            <FaLinkedin className="icon" />
                        </span>
                        <a href = "https://www.linkedin.com/in/kishore-p-858385288/" target="_blank" rel="noopener noreferrer">linkedin.com/in/kishore</a>
                    </p>
                    <p>
                        <span className="circle-icon">
                            <FaGithub className="icon" />
                        </span>
                        <a href = "https://github.com/xertz1" target="_blank" rel="noopener noreferrer">github.com/kishore</a>
                    </p>
                </div>

                <div className="footer-section">
                    <h3 className="title">Reach out</h3>
                    <a href="mailto:kpirathe@uwo.ca" className="email-button">
                        <button type="button">Email Me</button>
                    </a>
                </div>

                <p className="footer-bottom">Smart Planner</p>
            </div>
        </footer>
    );
}

export default Footer;