import '../components/signup.css'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom';
import '../components/settings.css'

const Signup = () => {
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [email, setEmail ] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {displayName: `${firstName} ${lastName}`});

            console.log("user signed up:", user);
            navigate('/');

        } catch (error) {
            const errorMesssage = error.message;
            const errorCode = error.code;
            console.error(errorCode, errorMesssage);
            setError(errorMesssage);
            
        }

    };

    return (
        <section className="signup-section">
            <div className="signup-area">
                <h2>Sign Up</h2>
                <form className="signup-form" onSubmit={onSubmit}>
                    <input type='text' id='first-name' name='first-name' value={firstName} onChange={(e) => setFirstName(e.target.value)}required placeholder='First Name'></input>
                    <input type='text' id='last-name' name='last-name' value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder='Last Name'></input>
                    <input type='text' id='email' name='email'value={email} onChange={(e) => setEmail(e.target.value)}  required placeholder='Email'></input>
                    <input type='password' id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='Password'></input> 
                    <button type='submit' id='submit-button'>Submit</button>
                </form>
                <p className='login-text'>Have an Account? <a href='/'>Login</a></p>
                {error && <p className='error-message'>{error}</p>}
            </div>
        </section>
    );
}

export default Signup;