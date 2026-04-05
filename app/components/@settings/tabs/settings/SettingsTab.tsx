import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { Switch } from '~/components/ui/Switch';
import type { UserProfile } from '~/components/@settings/core/types';
import { isMac } from '~/utils/os';
import { sudoPasswordHashStore, setSudoPassword } from '~/lib/stores/settings';

// Helper to get modifier key symbols/text
const getModifierSymbol = (modifier: string): string => {
  switch (modifier) {
    case 'meta':
      return isMac ? '⌘' : 'Win';
    case 'alt':
      return isMac ? '⌥' : 'Alt';
    case 'shift':
      return '⇧';
    default:
      return modifier;
  }
};

export default function SettingsTab() {
  const [currentTimezone, setCurrentTimezone] = useState('');
  const [settings, setSettings] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bolt_user_profile');
    return saved
      ? JSON.parse(saved)
      : {
          notifications: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
  });

  // Sudo mode state
  const sudoPasswordHash = useStore(sudoPasswordHashStore);
  const [newSudoPassword, setNewSudoPassword] = useState('');
  const [confirmSudoPassword, setConfirmSudoPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Save settings automatically when they change
  useEffect(() => {
    try {
      // Get existing profile data
      const existingProfile = JSON.parse(localStorage.getItem('bolt_user_profile') || '{}');

      // Merge with new settings
      const updatedProfile = {
        ...existingProfile,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
      };

      localStorage.setItem('bolt_user_profile', JSON.stringify(updatedProfile));
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    }
  }, [settings]);

  return (
    <div className="space-y-4">
      {/* Language & Notifications */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:palette-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Preferences</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:translate-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">Language</label>
          </div>
          <select
            value={settings.language}
            onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            className={classNames(
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
              'border border-[#E5E5E5] dark:border-[#1A1A1A]',
              'text-bolt-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
              'transition-all duration-200',
            )}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:bell-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">Notifications</label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-bolt-elements-textSecondary">
              {settings.notifications ? 'Notifications are enabled' : 'Notifications are disabled'}
            </span>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => {
                // Update local state
                setSettings((prev) => ({ ...prev, notifications: checked }));

                // Update localStorage immediately
                const existingProfile = JSON.parse(localStorage.getItem('bolt_user_profile') || '{}');
                const updatedProfile = {
                  ...existingProfile,
                  notifications: checked,
                };
                localStorage.setItem('bolt_user_profile', JSON.stringify(updatedProfile));

                // Dispatch storage event for other components
                window.dispatchEvent(
                  new StorageEvent('storage', {
                    key: 'bolt_user_profile',
                    newValue: JSON.stringify(updatedProfile),
                  }),
                );

                toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Timezone */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:clock-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Time Settings</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:globe-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">Timezone</label>
          </div>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
            className={classNames(
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
              'border border-[#E5E5E5] dark:border-[#1A1A1A]',
              'text-bolt-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
              'transition-all duration-200',
            )}
          >
            <option value={currentTimezone}>{currentTimezone}</option>
          </select>
        </div>
      </motion.div>

      {/* Simplified Keyboard Shortcuts */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:keyboard-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Keyboard Shortcuts</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A]">
            <div className="flex flex-col">
              <span className="text-sm text-bolt-elements-textPrimary">Toggle Theme</span>
              <span className="text-xs text-bolt-elements-textSecondary">Switch between light and dark mode</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs font-semibold text-bolt-elements-textSecondary bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#1A1A1A] rounded shadow-sm">
                {getModifierSymbol('meta')}
              </kbd>
              <kbd className="px-2 py-1 text-xs font-semibold text-bolt-elements-textSecondary bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#1A1A1A] rounded shadow-sm">
                {getModifierSymbol('alt')}
              </kbd>
              <kbd className="px-2 py-1 text-xs font-semibold text-bolt-elements-textSecondary bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#1A1A1A] rounded shadow-sm">
                {getModifierSymbol('shift')}
              </kbd>
              <kbd className="px-2 py-1 text-xs font-semibold text-bolt-elements-textSecondary bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#1A1A1A] rounded shadow-sm">
                D
              </kbd>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sudo Mode (Developer Mode Protection) */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="i-ph:lock-key-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Sudo Mode</span>
          {sudoPasswordHash && (
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
              Protected
            </span>
          )}
        </div>
        <p className="text-xs text-bolt-elements-textSecondary mb-4">
          Set a password to protect Developer Mode. When a sudo password is set, it will be required each time you
          enable Developer Mode.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-bolt-elements-textSecondary mb-1">
              {sudoPasswordHash ? 'New Password' : 'Set Password'}
            </label>
            <input
              type="password"
              value={newSudoPassword}
              onChange={(e) => setNewSudoPassword(e.target.value)}
              placeholder={sudoPasswordHash ? 'Enter new password' : 'Enter password'}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#1A1A1A]',
                'border border-[#E5E5E5] dark:border-[#2A2A2A]',
                'text-bolt-elements-textPrimary placeholder-gray-400 dark:placeholder-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div>
            <label className="block text-xs text-bolt-elements-textSecondary mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmSudoPassword}
              onChange={(e) => setConfirmSudoPassword(e.target.value)}
              placeholder="Confirm password"
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#1A1A1A]',
                'border border-[#E5E5E5] dark:border-[#2A2A2A]',
                'text-bolt-elements-textPrimary placeholder-gray-400 dark:placeholder-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              disabled={!newSudoPassword || newSudoPassword !== confirmSudoPassword || isSavingPassword}
              onClick={async () => {
                setIsSavingPassword(true);

                try {
                  await setSudoPassword(newSudoPassword);
                  setNewSudoPassword('');
                  setConfirmSudoPassword('');
                  toast.success('Sudo password saved');
                } catch {
                  toast.error('Failed to save sudo password');
                } finally {
                  setIsSavingPassword(false);
                }
              }}
              className={classNames(
                'px-4 py-2 rounded-lg text-sm font-medium',
                'bg-purple-500 text-white hover:bg-purple-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors duration-200',
              )}
            >
              {isSavingPassword ? (
                <span className="flex items-center gap-2">
                  <div className="i-ph:spinner-gap-bold animate-spin w-4 h-4" />
                  Saving…
                </span>
              ) : sudoPasswordHash ? (
                'Change Password'
              ) : (
                'Set Password'
              )}
            </button>

            {sudoPasswordHash && (
              <button
                onClick={async () => {
                  await setSudoPassword('');
                  toast.success('Sudo password removed');
                }}
                className={classNames(
                  'px-4 py-2 rounded-lg text-sm font-medium',
                  'text-red-500 dark:text-red-400',
                  'hover:bg-red-50 dark:hover:bg-red-500/10',
                  'transition-colors duration-200',
                )}
              >
                Remove Password
              </button>
            )}
          </div>

          {newSudoPassword && confirmSudoPassword && newSudoPassword !== confirmSudoPassword && (
            <p className="text-xs text-red-500 dark:text-red-400">Passwords do not match</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
