'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  ArrowPathIcon,
  PlayCircleIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]
const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
]

export default function Header() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLoggedIn = !!localStorage.getItem('authToken')
  const userId = localStorage.getItem('userId') || null

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-md">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')} aria-label="Home">
            <span className="bg-blue-900 text-white text-lg font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
              I
            </span>
            <h1 className="text-blue-900 text-2xl font-semibold tracking-tight">Influenzer</h1>
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            aria-label="Open main menu"
            aria-expanded={mobileMenuOpen}
          >
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900">
              Product
              <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400" />
            </PopoverButton>
            <PopoverPanel
              transition
              className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
              <div className="p-4">
                {products.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                  >
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href={item.href} className="block font-semibold text-gray-900">
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                {callsToAction.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                  >
                    <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                    {item.name}
                  </a>
                ))}
              </div>
            </PopoverPanel>
          </Popover>
          <button
            className="text-sm/6 font-semibold text-gray-900 hover:text-blue-900 transition-colors"
            onClick={() => navigate('/')}
            aria-label="Jobs"
          >
            Jobs
          </button>
          <button
            className="text-sm/6 font-semibold text-gray-900 hover:text-blue-900 transition-colors"
            onClick={() => navigate('/companies')}
            aria-label="Companies"
          >
            Companies
          </button>
          <button
            className="text-sm/6 font-semibold text-gray-900 hover:text-blue-900 transition-colors"
            onClick={() => navigate('/services')}
            aria-label="Services"
          >
            Services
          </button>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {isLoggedIn ? (
            <>
              <button
                className="text-sm/6 font-semibold text-gray-900 hover:text-blue-900 transition-colors"
                onClick={() => navigate(userId ? `/profile/${userId}` : '/profile')}
                aria-label="Profile"
              >
                Profile
              </button>
              <button
                className="bg-blue-900 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-blue-800 transition-all"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-blue-900 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-blue-800 transition-all"
                onClick={() => navigate('/login')}
                aria-label="Login"
              >
                Login
              </button>
              <button
                className="bg-orange-500 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-orange-600 transition-all"
                onClick={() => navigate('/register')}
                aria-label="Register"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')} aria-label="Home">
              <span className="bg-blue-900 text-white text-lg font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
                I
              </span>
              <h1 className="text-blue-900 text-2xl font-semibold tracking-tight">Influenzer</h1>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              aria-label="Close menu"
            >
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <PopoverGroup>
                  <Popover className="relative">
                    <PopoverButton className="flex w-full items-center justify-between rounded-lg py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                      Product
                      <ChevronDownIcon aria-hidden="true" className="size-5 flex-none" />
                    </PopoverButton>
                    <PopoverPanel className="mt-2 space-y-2">
                      {[...products, ...callsToAction].map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </a>
                      ))}
                    </PopoverPanel>
                  </Popover>
                </PopoverGroup>
                <button
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => navigate('/')}
                  aria-label="Jobs"
                >
                  Jobs
                </button>
                <button
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => navigate('/companies')}
                  aria-label="Companies"
                >
                  Companies
                </button>
                <button
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => navigate('/services')}
                  aria-label="Services"
                >
                  Services
                </button>
              </div>
              <div className="py-2">
                {isLoggedIn ? (
                  <>
                    <button
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      onClick={() => navigate(userId ? `/profile/${userId}` : '/profile')}
                      aria-label="Profile"
                    >
                      Profile
                    </button>
                    <button
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      onClick={handleLogout}
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      onClick={() => navigate('/login')}
                      aria-label="Login"
                    >
                      Login
                    </button>
                    <button
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      onClick={() => navigate('/register')}
                      aria-label="Register"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}