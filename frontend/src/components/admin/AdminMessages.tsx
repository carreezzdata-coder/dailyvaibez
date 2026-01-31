'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/components/includes/Session';

interface Message {
  message_id: number;
  sender_id: number;
  sender_name: string;
  sender_first_name: string;
  sender_last_name: string;
  receiver_id: number | null;
  receiver_first_name: string;
  receiver_last_name: string;
  message_text: string;
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
}

interface Admin {
  admin_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
}

const AdminMessages: React.FC = () => {
  const { user, csrfToken } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent' | 'broadcast'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const canBroadcast = user?.role && ['super_admin', 'admin'].includes(user.role);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/adminmessages?type=${activeTab}`, {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, csrfToken]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/adminmessages?endpoint=unread-count', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [csrfToken]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/adminmessages?endpoint=admins-list', {
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }, [csrfToken]);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
    fetchAdmins();
  }, [fetchMessages, fetchUnreadCount, fetchAdmins]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!isBroadcast && !selectedReceiver) {
      alert('Please select a receiver');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/admin/adminmessages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          receiver_id: isBroadcast ? null : selectedReceiver,
          message_text: messageText,
          is_broadcast: isBroadcast
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Message sent successfully');
        setMessageText('');
        setSelectedReceiver(null);
        setIsBroadcast(false);
        setShowCompose(false);
        fetchMessages();
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/admin/adminmessages?message_id=${messageId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      if (response.ok) {
        fetchMessages();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/admin/adminmessages?message_id=${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      if (response.ok) {
        alert('Message deleted successfully');
        fetchMessages();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Network error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="admin-messages">
      <div className="messages-header">
        <h1>Messages</h1>
        <div className="header-actions">
          <button className="compose-btn" onClick={() => setShowCompose(!showCompose)}>
            ✉️ Compose
          </button>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
      </div>

      {showCompose && (
        <div className="compose-form">
          <form onSubmit={handleSendMessage}>
            <div className="form-row">
              {canBroadcast && (
                <label className="broadcast-toggle">
                  <input
                    type="checkbox"
                    checked={isBroadcast}
                    onChange={(e) => {
                      setIsBroadcast(e.target.checked);
                      if (e.target.checked) setSelectedReceiver(null);
                    }}
                  />
                  <span>📢 Broadcast to all admins</span>
                </label>
              )}
            </div>

            {!isBroadcast && (
              <div className="form-row">
                <label>To:</label>
                <select
                  value={selectedReceiver || ''}
                  onChange={(e) => setSelectedReceiver(Number(e.target.value))}
                  required
                >
                  <option value="">Select receiver...</option>
                  {admins.map(admin => (
                    <option key={admin.admin_id} value={admin.admin_id}>
                      {admin.first_name} {admin.last_name} ({admin.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowCompose(false)}>
                Cancel
              </button>
              <button type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="messages-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={activeTab === 'received' ? 'active' : ''}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
        <button
          className={activeTab === 'sent' ? 'active' : ''}
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
        <button
          className={activeTab === 'broadcast' ? 'active' : ''}
          onClick={() => setActiveTab('broadcast')}
        >
          Broadcast
        </button>
      </div>

      <div className="messages-list">
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages found</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.message_id}
              className={`message-item ${!message.is_read && message.receiver_id === user?.admin_id ? 'unread' : ''}`}
            >
              <div className="message-header">
                <div className="message-sender">
                  {message.is_broadcast && <span className="broadcast-badge">📢 Broadcast</span>}
                  <strong>
                    {message.sender_id === user?.admin_id
                      ? 'You'
                      : `${message.sender_first_name || message.sender_name} ${message.sender_last_name || ''}`}
                  </strong>
                  {message.receiver_id && message.receiver_id !== user?.admin_id && (
                    <span className="to"> to {message.receiver_first_name} {message.receiver_last_name}</span>
                  )}
                </div>
                <div className="message-meta">
                  <span className="message-time">{formatDate(message.created_at)}</span>
                  {!message.is_read && message.receiver_id === user?.admin_id && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(message.message_id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  {(message.sender_id === user?.admin_id || ['super_admin', 'admin'].includes(user?.role || '')) && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMessage(message.message_id)}
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="message-text">{message.message_text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;