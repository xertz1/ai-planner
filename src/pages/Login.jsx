import React, {useState} from 'react';
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'
import '../components/login.css'


const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onLogin = async (e) => {
        e.preventDefault();

        try {
            const userCredential =  await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
            navigate('/dashboard');

        } catch(error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            setError(errorMessage);
        }

    }

    return (
        <section className="login-section">
            <div className="login-area">
                <h2>Login</h2>
                <form className="login-form" onSubmit={onLogin}>
                    <input type='text' id='email' name='email' required placeholder='Email' onChange={(e)=>setEmail(e.target.value)}></input>
                    <input type='password' id='password' name='password' required placeholder='Password' onChange={(e)=>setPassword(e.target.value)}></input> 
                    <button type='submit' id='submit-button'>Submit</button>
                </form>
                <p className='signup-text'>Dont have an Account? <a href='/signup'>Sign up</a></p>
                {error && <p className='error-message'>{error}</p>}
            </div>
        </section>
    );

};

export default Login;