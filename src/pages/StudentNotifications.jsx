import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Check, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { getStoredResources } from '../services/resourceService';

export default function StudentNotifications({ onOpenPDF }) {
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);

  const loadData = () => {
    setNotifications(getNotifications());
    setResources(getStoredResources());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('iert_notifications_updated', loadData);
    return () => window.removeEventListener('iert_notifications_updated', loadData);
  }, []);

  const handleMarkRead = (id) => {
    markAsRead(id);
    loadData();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadData();
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Bell className="w-4 h-4 text-cyan-500" />
            <span>Academic Notifications</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real updates when new notes, PYQs, assignments, or syllabus files are uploaded.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            type="button"
            className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Notifications Stream */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => {
            const linkedResource = n.resourceId ? resources.find(r => String(r.id) === String(n.resourceId)) : null;

            return (
              <div
                key={n.id}
                className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !n.read 
                    ? 'border-cyan-500/40 bg-cyan-500/5 dark:bg-cyan-500/10' 
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60'
                }`}
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                    <h3 className={`text-sm font-bold ${!n.read ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>

                  <span className="text-[10px] font-semibold text-slate-400 block pt-1">
                    {formatDate(n.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {linkedResource && onOpenPDF && (
                    <button
                      onClick={() => onOpenPDF(linkedResource)}
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      type="button"
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 my-8 space-y-3">
          <Bell className="w-10 h-10 text-cyan-500/40 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No notifications yet</h3>
          <p className="text-xs text-slate-500">You will receive alerts here whenever new academic materials are uploaded.</p>
        </div>
      )}

    </div>
  );
}
