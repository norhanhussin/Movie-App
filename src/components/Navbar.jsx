import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { FaBars, FaTimes } from "react-icons/fa"
import SearchBar from "./SearchBar"
import { DarkModeToggle } from "./DarkModeToggle"
import LanguageDropdown from "./LanguageDropdown"
import useLanguageStore from "@/store/Language"
import useAuthStore from "@/store/authStore"
import useWishlistStore from "@/store/wishlistStore"
import { useTranslation } from "react-i18next"

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.wishlist.length);

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <nav className="bg-white/80 backdrop-blur-md h-16 dark:bg-[#0d1b2a]/95 border-b border-gray-200/50 dark:border-gray-800 flex items-center sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="mx-auto w-full px-6 flex justify-between items-center group">

        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="font-black text-[#01b4e4] text-2xl tracking-tighter hover:scale-105 transition-transform">
            TMDB
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex gap-6 text-black dark:text-white font-semibold text-[15px]">
            <Link to="/movieslist" className="hover:text-[#01b4e4] transition-colors">
              {t('navbar.movies')}
            </Link>
            <Link to="/wishlist" className="hover:text-[#01b4e4] transition-colors flex items-center gap-1">
              <span>{t('navbar.wishlist')}</span>
              {user ? wishlistCount > 0 && (
                <span className="bg-[#01b4e4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm animate-in zoom-in duration-300">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
          </ul>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-6">
          <SearchBar />

          <LanguageDropdown
            language={language}
            setLanguage={setLanguage}
          />

          <div className="flex items-center gap-6 text-black dark:text-white font-semibold text-[15px]">
            {!user ? (
              <>
                <Link to="/login" className="hover:text-[#01b4e4] transition-colors">
                  {t('navbar.login')}
                </Link>
                <Link to="/register" className="hover:text-[#01b4e4] transition-colors">
                  {t('navbar.join_tmdb')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/account" className="hover:text-[#01b4e4] transition-colors">
                  {t('navbar.account')}
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-[#01b4e4] transition-colors cursor-pointer"
                >
                  {t('navbar.logout')}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 border-l dark:border-gray-700 pl-6">
            <DarkModeToggle />
            {user && (
              <div className="w-8 h-8 rounded-full bg-[#c0392b] flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:ring-2 hover:ring-[#01b4e4] transition-all">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4 text-black dark:text-white">
          {}
          <DarkModeToggle />

          <FaBars
            className="text-xl cursor-pointer hover:text-[#01b4e4] transition-colors"
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 w-full h-screen bg-black/95 text-white flex flex-col p-8 gap-6 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
          <FaTimes
            className="text-2xl self-end cursor-pointer hover:text-[#01b4e4] transition-colors"
            onClick={() => setMenuOpen(false)}
          />

          <div className="flex flex-col gap-6 text-xl font-bold">
            <Link to="/movieslist" className="cursor-pointer" onClick={() => setMenuOpen(false)}>{t('navbar.movies')}</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center cursor-pointer gap-2">
              <span>{t('navbar.wishlist')}</span>
              {user ? wishlistCount > 0 && (
                <span className="bg-[#01b4e4] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <div className="h-px bg-white/10 my-2" />

            {!user ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="cursor-pointer">{t('navbar.login')} </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="cursor-pointer">{t('navbar.join_tmdb')}</Link>
              </>
            ) : (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="cursor-pointer">{t('navbar.account')}</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left cursor-pointer">{t('navbar.logout')}</button>
              </>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 capitalize">{t('navbar.lang_' + language)}</span>
              <LanguageDropdown
                language={language}
                setLanguage={setLanguage}
              />
            </div>
            <SearchBar />
          </div>
        </div>
      )}
    </nav>
  )
}
