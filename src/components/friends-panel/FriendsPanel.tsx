import { Dialog, Transition } from '@headlessui/react'
import { Fragment, type ReactNode } from 'react'

export default function FriendsPanel({
open, onClose, children,
}: { open: boolean; onClose: () => void; children?: ReactNode }) {
return (
<Transition show={open} as={Fragment}>
<Dialog onClose={onClose} className="relative z-50">
<Transition.Child
as={Fragment}
enter="transition-opacity ease-out duration-200"
enterFrom="opacity-0"
enterTo="opacity-100"
leave="transition-opacity ease-in duration-150"
leaveFrom="opacity-100"
leaveTo="opacity-0"
>
<div className="fixed inset-0 bg-black/50" />
</Transition.Child>

    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 flex justify-end">
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="h-full w-[22rem] sm:w-[28rem] bg-[rgba(12,11,24,0.98)] border-l border-white/10 p-4 shadow-xl focus:outline-none">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-white font-semibold">Friends</Dialog.Title>
              <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-2.5rem)]">
              {children}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>
)
}