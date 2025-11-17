import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../../config/axios";
import Loader from "../layouts/Loader";

const FirebaseResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("extracting");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionCode, setActionCode] = useState("");

  useEffect(() => {
    const extractActionCode = async () => {
      try {
        setStatus("extracting");
        
        // Extract all URL parameters for debugging
        const allParams = Object.fromEntries(searchParams.entries());
        console.log('🔥 All URL parameters:', allParams);

        // Also check window.location for any fragments or query strings
        console.log('🌐 Window location:', {
          href: window.location.href,
          search: window.location.search,
          hash: window.location.hash,
          pathname: window.location.pathname
        });

        // Try all possible parameter names for action code
        const extractedActionCode =
          searchParams.get('oobCode') ||
          searchParams.get('actionCode') ||
          searchParams.get('code') ||
          searchParams.get('oobcode') ||
          searchParams.get('actioncode') ||
          searchParams.get('link');

        console.log('🔍 Extracted action code:', extractedActionCode);

        // If action code is not found, try to extract from browser storage (Firebase stores it when handleCodeInApp: true)
        let finalActionCode = extractedActionCode;
        
        if (!finalActionCode) {
          // Firebase stores the action code in various storage locations when using handleCodeInApp: true
          const storageKeys = [
            'firebase:auth:action:code',
            'FIREBASE_AUTH_ACTION_CODE',
            'firebase_action_code',
            'actionCode',
            'oobCode'
          ];
          
          for (const key of storageKeys) {
            const storedActionCode = sessionStorage.getItem(key) || localStorage.getItem(key);
            if (storedActionCode) {
              console.log(`🔍 Action code found in storage with key "${key}":`, storedActionCode);
              finalActionCode = storedActionCode;
              
              // Clear the stored action code after retrieval
              sessionStorage.removeItem(key);
              localStorage.removeItem(key);
              break;
            }
          }
        }

        // Additional extraction methods
        if (!finalActionCode && searchParams.get('link')) {
          try {
            const linkParam = searchParams.get('link');
            const linkUrl = new URL(linkParam);
            const linkParams = new URLSearchParams(linkUrl.search);
            finalActionCode = linkParams.get('oobCode') || linkParams.get('code');
            console.log('🔍 Action code from link parameter:', finalActionCode);
          } catch (parseError) {
            console.error('❌ Error parsing link parameter:', parseError);
          }
        }

        if (!finalActionCode && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          finalActionCode = hashParams.get('oobCode') || hashParams.get('code');
          console.log('🔍 Action code from hash:', finalActionCode);
        }

        if (!finalActionCode && document.referrer) {
          try {
            const referrerUrl = new URL(document.referrer);
            const referrerParams = new URLSearchParams(referrerUrl.search);
            finalActionCode = referrerParams.get('oobCode') || referrerParams.get('code');
            console.log('🔍 Action code from referrer:', finalActionCode);
          } catch (referrerError) {
            console.error('❌ Error parsing referrer:', referrerError);
          }
        }

        if (!finalActionCode) {
          const urlMatch = window.location.href.match(/[?&](oobCode|code|actionCode)=([^&]+)/);
          if (urlMatch) {
            finalActionCode = urlMatch[2];
            console.log('🔍 Action code extracted from URL pattern:', finalActionCode);
          }
        }

        if (!finalActionCode) {
          console.error('❌ No action code found');
          setStatus("error");
          setMessage("Invalid password reset link. Please make sure you clicked the reset link directly from your email.");
          return;
        }

        setActionCode(finalActionCode);
        setStatus("ready");
        
      } catch (error) {
        console.error('❌ Error extracting action code:', error);
        setStatus("error");
        setMessage("Failed to process reset link. Please try again.");
      }
    };

    extractActionCode();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setStatus("processing");
    setMessage("");

    try {
      console.log('🔐 Calling Firebase password reset endpoint with action code:', actionCode);
      
      const { data } = await apiClient.post('/auth/firebase-reset-password', {
        actionCode: actionCode,
        newPassword: password
      });
      
      setStatus("success");
      setMessage(data.message || "Password reset successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Password reset failed. Please try again.");
      console.error("Firebase password reset error:", error);
    }
  };

  return (
    <div className="form-container" style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Firebase Password Reset</h2>
      
      {status === "extracting" && (
        <div>
          <Loader />
          <p>Processing reset link...</p>
        </div>
      )}
      
      {status === "ready" && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="New Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
              style={{ width: '100%', padding: '12px', margin: '10px 0' }}
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              minLength="6"
              style={{ width: '100%', padding: '12px', margin: '10px 0' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ padding: '12px 30px', margin: '10px' }}
          >
            Reset Password
          </button>
        </form>
      )}
      
      {status === "processing" && (
        <div>
          <Loader />
          <p>Resetting your password...</p>
        </div>
      )}
      
      {status === "success" && (
        <div style={{ color: 'green' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h3>Password Reset Successful!</h3>
          <p>{message}</p>
          <p>Redirecting to login page...</p>
        </div>
      )}
      
      {status === "error" && (
        <div style={{ color: 'red' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✗</div>
          <h3>Reset Failed</h3>
          <p>{message}</p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ marginRight: '15px', padding: '10px 20px' }}
            >
              Go to Login
            </button>
            <button 
              onClick={() => navigate('/forgot-password')}
              style={{ padding: '10px 20px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseResetPassword;