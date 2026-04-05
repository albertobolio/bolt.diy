import { useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { verifySudoPassword } from '~/lib/stores/settings';

interface SudoPasswordDialogProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export const SudoPasswordDialog = ({ open, onVerified, onCancel }: SudoPasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const valid = await verifySudoPassword(password);

      if (valid) {
        setPassword('');
        onVerified();
      } else {
        setError('Incorrect password. Please try again.');
        toast.error('Incorrect sudo password');
      }
    } catch {
      setError('An error occurred while verifying the password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <RadixDialog.Root open={open}>
      <RadixDialog.Portal>
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
          <RadixDialog.Overlay asChild>
            <motion.div
              className="absolute inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleCancel}
            />
          </RadixDialog.Overlay>

          <RadixDialog.Content
            aria-describedby="sudo-dialog-description"
            onEscapeKeyDown={handleCancel}
            className="relative z-[201]"
          >
            <motion.div
              className={classNames(
                'w-[420px]',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'rounded-2xl shadow-2xl',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'p-6',
              )}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 dark:bg-purple-500/20">
                  <div className="i-ph:lock-key-fill w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <RadixDialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                    Sudo Mode
                  </RadixDialog.Title>
                  <p id="sudo-dialog-description" className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Enter your sudo password to enable Developer Mode
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter sudo password"
                    autoFocus
                    className={classNames(
                      'w-full px-3 py-2 rounded-lg text-sm',
                      'bg-white dark:bg-[#1A1A1A]',
                      'border',
                      error
                        ? 'border-red-400 dark:border-red-500 focus:ring-red-500/30'
                        : 'border-[#E5E5E5] dark:border-[#2A2A2A] focus:ring-purple-500/30',
                      'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600',
                      'focus:outline-none focus:ring-2',
                      'transition-all duration-200',
                    )}
                  />
                  {error && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>}
                </div>

                <div className="flex items-center gap-3 justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={classNames(
                      'px-4 py-2 rounded-lg text-sm font-medium',
                      'text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-100 dark:hover:bg-[#1A1A1A]',
                      'transition-colors duration-200',
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!password || isVerifying}
                    className={classNames(
                      'px-4 py-2 rounded-lg text-sm font-medium',
                      'bg-purple-500 text-white',
                      'hover:bg-purple-600',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors duration-200',
                    )}
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <div className="i-ph:spinner-gap-bold animate-spin w-4 h-4" />
                        Verifying…
                      </span>
                    ) : (
                      'Unlock'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
