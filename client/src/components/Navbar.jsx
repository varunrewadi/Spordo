import { Fragment, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "/logo/logo.png";

const contactItem = { to: "/contact", label: "Contact" };
const navItems = [
  { to: "/", label: "Home" },
  { to: "/sports-coach", label: "Sports Coach" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-black border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="SPORDO home">
            <span className="text-2xl font-bold text-white">SPORDO</span>
            <img
              src={logo}
              alt="SPORDO logo"
              className="h-12 w-auto filter invert"
            />
          </Link>
          <nav
            className="hidden md:flex items-center gap-5"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "relative text-sm font-body font-medium tracking-wide transition-colors px-3 py-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/70",
                    isActive ? "text-white" : "text-white/90 hover:text-white",
                    "transition-all duration-300",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <span className="inline-block relative">
                    <span className="inline-block">{item.label}</span>
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1 left-0 h-0.5 w-full rounded bg-white transform transition-all duration-300 ${
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0"
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
            <NavLink
              to={contactItem.to}
              className={({ isActive }) =>
                `rounded-md text-sm font-body font-bold uppercase tracking-wide transition-all duration-200 bg-indigo-600 text-white px-4 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/70 ml-2 ${
                  isActive ? "ring-2 ring-white/20" : ""
                }`
              }
            >
              {contactItem.label}
            </NavLink>
          </nav>
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-6 px-6 pb-6 pt-6 bg-black/95 border-r border-white/10">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/"
                      className="flex items-center"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-2xl font-bold text-white">
                        SPORDO
                      </span>
                      <img
                        src={logo}
                        alt="SPORDO logo"
                        className="h-10 w-auto ml-2 filter invert"
                      />
                    </Link>
                    <button
                      className="p-2 rounded-md hover:bg-white/10"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <nav className="space-y-3" aria-label="Mobile">
                    {navItems.map((item) => (
                      <div
                        key={item.to}
                        className="border-b border-white/10 pb-2"
                      >
                        <NavLink
                          to={item.to}
                          onClick={() => {
                            setOpen(false);
                          }}
                          className={({ isActive }) =>
                            `relative block px-3 py-3 text-sm font-body font-medium tracking-wide transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${
                              isActive
                                ? "text-white"
                                : "text-white/90 hover:text-white"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <span className="inline-block relative">
                              <span className="inline-block">{item.label}</span>
                              <span
                                aria-hidden="true"
                                className={`absolute -bottom-1 left-0 h-0.5 w-full rounded bg-white transform transition-all duration-300 ${
                                  isActive
                                    ? "opacity-100 scale-x-100"
                                    : "opacity-0 scale-x-0"
                                }`}
                              />
                            </span>
                          )}
                        </NavLink>
                      </div>
                    ))}
                    <NavLink
                      to={contactItem.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-3 mt-4 rounded-md text-sm font-body font-medium uppercase tracking-wide transition-colors bg-indigo-600 text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/70 ${
                          isActive ? "ring-2 ring-white/20" : ""
                        }`
                      }
                    >
                      {contactItem.label}
                    </NavLink>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
