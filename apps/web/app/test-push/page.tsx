'use client';

/**
 * Web Push Test Page
 * Allows testing push notification subscription and delivery
 */

import { useState, useEffect } from 'react';
import {
  registerWebPush,
  unregisterWebPush,
  isSubscribedToWebPush,
  sendTestPush,
} from '@/lib/webpush-client';

export default function TestPushPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testTitle, setTestTitle] = useState('TodayPool Reminder');
  const [testBody, setTestBody] = useState('Pick up groceries #personal !2');

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    const subscribed = await isSubscribedToWebPush();
    setIsSubscribed(subscribed);
  }

  async function handleSubscribe() {
    setLoading(true);
    setMessage('');

    try {
      const subscription = await registerWebPush();
      if (subscription) {
        setIsSubscribed(true);
        setMessage('✅ Successfully subscribed to push notifications!');
      } else {
        setMessage('❌ Failed to subscribe. Check browser permissions.');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    setMessage('');

    try {
      const success = await unregisterWebPush();
      if (success) {
        setIsSubscribed(false);
        setMessage('✅ Successfully unsubscribed from push notifications');
      } else {
        setMessage('❌ Failed to unsubscribe');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    setLoading(true);
    setMessage('');

    try {
      const success = await sendTestPush(testTitle, testBody, 'test-task-id');
      if (success) {
        setMessage('✅ Test notification sent! Check your notifications.');
      } else {
        setMessage('❌ Failed to send test notification');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>Web Push Test Page</h1>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <p>
          <strong>Status:</strong>{' '}
          {isSubscribed ? (
            <span style={{ color: 'green' }}>✓ Subscribed</span>
          ) : (
            <span style={{ color: 'red' }}>✗ Not subscribed</span>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe to Push'}
          </button>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
        )}
      </div>

      {isSubscribed && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <h2>Send Test Notification</h2>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Title:
            </label>
            <input
              type="text"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Body:
            </label>
            <textarea
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>

          <button
            onClick={handleSendTest}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send Test Push'}
          </button>

          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <p><strong>Notification Actions:</strong></p>
            <ul>
              <li>Done - Mark task as complete</li>
              <li>+10m - Snooze for 10 minutes</li>
              <li>+1h - Snooze for 1 hour</li>
              <li>Tomorrow AM - Move to tomorrow morning</li>
            </ul>
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: message.startsWith('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '4px',
        }}
      >
        <h3>Instructions</h3>
        <ol>
          <li>Click "Subscribe to Push" to register for notifications</li>
          <li>Grant notification permission when prompted by browser</li>
          <li>Customize the test notification title and body</li>
          <li>Click "Send Test Push" to receive a notification</li>
          <li>
            Test the action buttons on the notification:
            <ul>
              <li>
                <strong>Done</strong> - Calls /api/tasks.complete
              </li>
              <li>
                <strong>+10m</strong> - Calls /api/tasks.snooze with 10 minutes
              </li>
              <li>
                <strong>+1h</strong> - Calls /api/tasks.snooze with 60 minutes
              </li>
              <li>
                <strong>Tomorrow AM</strong> - Calls /api/tasks.snooze with preset
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            color: '#007bff',
            textDecoration: 'none',
          }}
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
