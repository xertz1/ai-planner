import React, { useState } from 'react';
import { auth } from '../firebase';
import {updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import '../components/settings.css'

const Settings = () => {
    const [newPassword, setNewPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); 
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const reauthenticate = async () => {
        const user = auth.currentUser;
        const cred = EmailAuthProvider.credential(user.email, currentPassword)
        await reauthenticateWithCredential(user, cred)
    }

    const handlePassChange = async (e) => {
        e.preventDefault();

        try {
            await reauthenticate();
            await updatePassword(auth.currentUser, newPassword);
            setMessage('Successfully Changed');
            setError('');

        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    }

    const handleEmailChange = async (e) => {
        e.preventDefault();

        try {
            await reauthenticate();
            await updateEmail(auth.currentUser, newEmail);
            setMessage('successfully Changed');
            setError('');

        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    }

    return (
        <div className='settings-contianer'>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
            <div className='passwordChange-container'>
                <h2>Reset Password</h2>
                <form className='reset-password' onSubmit={handlePassChange}>
                    <input type='text' id='current-password' placeholder='Enter Current Password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
                    <input type='text' id='new-password' placeholder='Enter New Password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                    <button type='submit'>Update Password</button>
                </form>
            </div>
            <div className='emailChange-container'>
                <h2>Reset Email</h2>
                <form className='reset-email' onSubmit={handleEmailChange}>
                    <input type='text' id='new-email' placeholder='Enter New Email' onChange={(e) => setNewEmail(e.target.value)}/>
                    <button type='submit'>Update Email</button>
                </form>
            </div>
        </div>
        
        
    );
}

export default Settings;