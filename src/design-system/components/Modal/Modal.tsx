/**
 * Modal Component
 * 
 * A standardized modal component using Headless UI Dialog.
 */

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utilities';
import { ModalProps } from './Modal.types';

/**
 * Modal component with multiple sizes and close options.
 * 
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
 *   <p>Modal content</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={closeOnOverlayClick ? onClose : () => {}}
        className="relative z-50"
        static={!closeOnEscape}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-backdrop" aria-hidden="true" />
        </Transition.Child>

        {/* Container */}
        <div className="modal-container">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className={cn(
                'modal-content',
                size === 'sm' && 'modal-sm',
                size === 'md' && 'modal-md',
                size === 'lg' && 'modal-lg',
                size === 'xl' && 'modal-xl',
                size === 'full' && 'modal-full'
              )}
            >
              {/* Header */}
              {(title || closeOnOverlayClick) && (
                <div className="flex items-center justify-between mb-4">
                  {title && <Dialog.Title className="modal-title">{title}</Dialog.Title>}
                  {closeOnOverlayClick && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

