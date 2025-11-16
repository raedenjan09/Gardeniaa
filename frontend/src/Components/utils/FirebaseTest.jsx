import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';

const FirebaseTest = () => {
  const [firebaseStatus, setFirebaseStatus] = useState('Checking...');
  const [config, setConfig] = useState(null);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Test if Firebase auth is initialized
        if (auth) {
          const authConfig = {
            apiKey: import.meta.env.VITE_APP_API_KEY,
            authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_APP_PROJECT_ID,
            appId: import.meta.env.VITE_APP_APP_ID
          };
          
          setConfig(authConfig);
          
          // Check environment variables
          const envCheck = {
            VITE_APP_API_KEY: !!import.meta.env.VITE_APP_API_KEY,
            VITE_APP_AUTH_DOMAIN: !!import.meta.env.VITE_APP_AUTH_DOMAIN,
            VITE_APP_PROJECT_ID: !!import.meta.env.VITE_APP_PROJECT_ID,
            VITE_APP_APP_ID: !!import.meta.env.VITE_APP_APP_ID,
            VITE_GOOGLE_CLIENT_ID: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
            VITE_FACEBOOK_APP_ID: !!import.meta.env.VITE_FACEBOOK_APP_ID
          };
          
          setEnvVars(envCheck);
          
          // Check if all required env vars are present
          const allSet = Object.values(envCheck).every(Boolean);
          
          if (allSet) {
            setFirebaseStatus('✅ Firebase configuration loaded successfully');
          } else {
            const missing = Object.entries(envCheck)
              .filter(([_, value]) => !value)
              .map(([key]) => key)
              .join(', ');
              
            setFirebaseStatus(`⚠️ Missing environment variables: ${missing}`);
          }
          
          console.log('Firebase Auth Config:', authConfig);
          console.log('Environment Variables Check:', envCheck);
        } else {
          setFirebaseStatus('❌ Firebase Auth not initialized');
        }
      } catch (error) {
        setFirebaseStatus(`❌ Error: ${error.message}`);
        console.error('Firebase test error:', error);
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', margin: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>Firebase Configuration Test</h3>
      
      <div style={{ padding: '10px', background: '#fff', borderRadius: '4px', marginBottom: '15px' }}>
        <p><strong>Status:</strong> {firebaseStatus}</p>
      </div>
      
      {config && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ color: '#555', marginBottom: '10px' }}>Current Configuration:</h4>
          <pre style={{ 
            background: '#fff', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '12px',
            overflow: 'auto',
            border: '1px solid #ddd'
          }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
      
      <div>
        <h4 style={{ color: '#555', marginBottom: '10px' }}>Environment Variables Status:</h4>
        <div style={{ background: '#fff', padding: '10px', borderRadius: '4px' }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '5px',
              padding: '5px',
              background: value ? '#e8f5e8' : '#ffe6e6',
              borderRadius: '3px'
            }}>
              <span style={{ 
                marginRight: '10px', 
                color: value ? 'green' : 'red',
                fontWeight: 'bold'
              }}>
                {value ? '✅' : '❌'}
              </span>
              <span style={{ fontFamily: 'monospace' }}>{key}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e7f3ff', borderRadius: '4px' }}>
        <h4 style={{ color: '#0066cc', marginBottom: '10px' }}>Next Steps:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Check Firebase Console to ensure Authentication is enabled</li>
          <li>Enable Google and Facebook providers in Firebase Authentication</li>
          <li>Add localhost to authorized domains in Firebase</li>
          <li>Configure OAuth credentials for Google and Facebook</li>
          <li>Restart the development server after making changes</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;