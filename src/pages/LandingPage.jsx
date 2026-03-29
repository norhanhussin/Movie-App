import { useState, useEffect } from 'react';
import { getNowPlaying, getPopular, getFreeToWatch, getPopularTV, getMovieVideos } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Play } from 'lucide-react';
import { NoResultsEmpty } from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useLanguageStore from '@/store/Language';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
    const { t } = useTranslation()
    const language = useLanguageStore((state) => state.language);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [freeMovies, setFreeMovies] = useState([]);
    const [activeBg, setActiveBg] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { user, logout } = useAuthStore();
    const [popularTab, setPopularTab] = useState("movie")
    const [trailerTab, setTrailerTab] = useState("popular")
    const [trailerMovies, setTrailerMovies] = useState([])
    const [query, setQuery] = useState("")
    const [trailerKey, setTrailerKey] = useState(null)
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const navigate = useNavigate()

    const handlePopularChange = async (type) => {
        setPopularTab(type)
        setPopularMovies([]) // ← امسحي الداتا الأول
        try {
            if (type === "movie") {
                const res = await getPopular(language)
                setPopularMovies(res.data.results)
            } else {
                const res = await getPopularTV(language)
                setPopularMovies(res.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleTrailerChange = async (type) => {
        setTrailerTab(type)
        setTrailerMovies([])
        try {
            if (type === "popular") {
                const res = await getPopular(language)
                setTrailerMovies(res.data.results)
            } else {
                const res = await getNowPlaying(language)
                setTrailerMovies(res.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const openTrailer = async (movieId) => {
        try {
            const res = await getMovieVideos(movieId)
            const trailer = res.data.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
            )
            if (trailer) {
                setTrailerKey(trailer.key)
                setIsTrailerOpen(true)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${query}`)
        }
    }

    const leaders = [
        {
            id: 1,
            name: "RuiZafon",
            avatar: "https://www.themoviedb.org/t/p/w64_and_h64_face/76191.jpg",
            allTime: 2058367,
            weekly: 22075,
            allTimeWidth: '85%',
            weeklyWidth: '45%'
        },
        {
            id: 2,
            name: "Samara",
            initial: "S",
            bgColor: "#d291bc",
            allTime: 4509700,
            weekly: 13446,
            allTimeWidth: '95%',
            weeklyWidth: '25%'
        }
    ];

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [nowPlaying, popular, free] = await Promise.all([
                    getNowPlaying(),
                    getPopular(),
                    getFreeToWatch()
                ])
                const trendingResults = nowPlaying.data.results
                setTrendingMovies(trendingResults)
                setFilteredMovies(trendingResults)
                setPopularMovies(popular.data.results)
                setFreeMovies(free.data.results)
                setTrailerMovies(popular.data.results)
                if (trendingResults.length > 0) {
                    setActiveBg(`https://image.tmdb.org/t/p/w1920_and_h600_multi_faces${trendingResults[0].backdrop_path}`)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchHomeData()
    }, [])

    // const handleSearch = (e) => {
    //     const query = e.target.value.toLowerCase();
    //     setSearchQuery(query);
    //     const filtered = trendingMovies.filter(movie => 
    //         movie.title.toLowerCase().includes(query)
    //     );
    //     setFilteredMovies(filtered);
    // };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredMovies(trendingMovies);
    };

    return (
        <div className="w-full bg-background text-foreground font-sans transition-colors duration-300">

            {/* 1. Hero Section */}
            <div className="relative h-[260px] sm:h-[300px] md:h-[400px] bg-[#032541] flex items-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-40"
                    style={{ backgroundImage: `url('https://www.themoviedb.org/t/p/w1920_and_h600_multi_faces/nS68U7p49X06L78X67X869a9G0A.jpg')` }}
                ></div>

                <div className="relative z-10 text-white w-full max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10 text-left">
                    <h1 className="text-[1.6rem] sm:text-[2.2rem] md:text-[3rem] font-bold mb-1 tracking-tight">
                        {t('landing_page.welcome')}, {user && user.username}
                    </h1>
                    <h2 className="text-[1.1rem] sm:text-[1.5rem] md:text-[2rem] font-semibold mb-4 md:mb-10 opacity-90 leading-tight">
                        {t('landing_page.subtitle')}
                    </h2>

                    <div className="relative w-full rounded-full bg-white flex items-center h-10 md:h-12 shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#01b4e4]">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('landing_page.search_placeholder')}
                            className="flex-1 px-4 md:px-6 text-gray-800 outline-none h-full text-sm md:text-lg"
                        />
                        <Button onClick={handleSearch} className="h-full px-4 md:px-8 cursor-pointer bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] rounded-s-0 rounded-e-full text-white font-bold hover:text-[#032541] transition-all text-sm md:text-base">
                            {t('landing_page.search')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. Trending Section */}
            <section className="relative pt-8 md:pt-10 pb-5 bg-background transition-colors duration-300">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex items-center gap-5 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold">{t('landing_page.trending')}</h2>
                    </div>

                    {filteredMovies.length > 0 ? (
                        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-10 custom-scrollbar">
                            {filteredMovies.map((movie) => (
                                <div key={movie.id} className="min-w-[130px] sm:min-w-[150px] md:min-w-[180px]">
                                    <MovieCard movie={movie} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10">
                            <NoResultsEmpty onClear={clearSearch} />
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Latest Trailers */}
            <section className="relative py-8 md:py-10 transition-all duration-1000 ease-in-out bg-[#032541]">
                <div className="absolute inset-0 opacity-30 bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url(${activeBg})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#032541] via-transparent to-[#032541] opacity-90"></div>

                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10 relative z-10">
                    <div className="flex flex-wrap items-center gap-3 md:gap-8 mb-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold">{t('landing_page.latest_trailers')}</h2>
                        <div className="flex border-2 border-[#1ed5a9] rounded-full font-bold text-xs sm:text-sm overflow-hidden h-7 shrink-0">
                            <button
                                onClick={() => handleTrailerChange("popular")}
                                className={`px-3 sm:px-5 whitespace-nowrap ${trailerTab === "popular"
                                    ? "bg-[#1ed5a9] text-[#032541]"
                                    : "text-[#1ed5a9] hover:bg-white/10"
                                    }`}
                            >
                                {t('landing_page.popular')}
                            </button>
                            <button
                                onClick={() => handleTrailerChange("streaming")}
                                className={`px-3 sm:px-5 whitespace-nowrap ${trailerTab === "streaming"
                                    ? "bg-[#1ed5a9] text-[#032541]"
                                    : "text-[#1ed5a9] hover:bg-white/10"
                                    }`}
                            >
                                {t('landing_page.streaming')}
                            </button>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 custom-scrollbar-light">
                        {trailerMovies.slice(0, 8).map((movie) => (
                            <div key={movie.id} onClick={() => openTrailer(movie.id)}
                                className="min-w-[240px] sm:min-w-[280px] md:min-w-[300px] group cursor-pointer"
                                onMouseEnter={() => setActiveBg(`https://image.tmdb.org/t/p/w1920_and_h600_multi_faces${movie.backdrop_path}`)}>
                                <div className="relative rounded-xl overflow-hidden aspect-video shadow-2xl border-2 border-transparent group-hover:border-[#1ed5a9] transition-all">
                                    <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/10 transition-all">
                                        <Play className="text-white fill-white w-10 h-10 md:w-14 md:h-14 opacity-90 group-hover:scale-125 transition-transform" />
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-center mt-3 text-sm md:text-lg group-hover:text-[#1ed5a9] transition-colors">{movie.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. What's Popular */}
            <section className="py-8 md:py-10 bg-background transition-colors duration-300">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex flex-wrap items-center gap-3 md:gap-5 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold">{t('landing_page.whats_popular')}</h2>
                        <div className="flex border-2 border-[#032541] dark:border-[#01b4e4] rounded-full font-bold text-xs sm:text-sm overflow-hidden h-8 shrink-0">
                            <button
                                onClick={() => handlePopularChange("movie")}
                                className={`px-3 sm:px-6 whitespace-nowrap ${popularTab === "movie"
                                    ? "bg-[#032541] dark:bg-[#01b4e4] text-[#1ed5a9]"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                {t('landing_page.streaming')}
                            </button>
                            <button
                                onClick={() => handlePopularChange("tv")}
                                className={`px-3 sm:px-6 whitespace-nowrap ${popularTab === "tv"
                                    ? "bg-[#032541] dark:bg-[#01b4e4] text-[#1ed5a9]"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                {t('landing_page.on_tv')}
                            </button>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-10 custom-scrollbar scroll-smooth">
                        {popularMovies.map((movie) => (
                            <div key={movie.id} className="min-w-[130px] sm:min-w-[150px] md:min-w-[180px] hover:scale-105 transition-transform duration-300">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Join Today Section */}
            <section className="relative min-h-[280px] md:min-h-[320px] text-white flex items-center overflow-hidden bg-[#1e0a3d]">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://www.themoviedb.org/t/p/w1920_and_h600_multi_faces/nS68U7p49X06L78X67X869a9G0A.jpg')` }}></div>

                <div className="relative z-10 max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10 w-full flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6 md:gap-10 py-8 md:py-0">
                    <div className="max-w-2xl text-left">
                        <h1 className="text-[1.6rem] sm:text-[2rem] md:text-[2.5rem] font-bold mb-3 md:mb-4">
                            {t('landing_page.join_today')}
                        </h1>
                        <p className="text-sm md:text-lg font-normal mb-6 md:mb-8 leading-relaxed opacity-90">
                            {t('landing_page.join_desc_1')} <span className="italic opacity-70">{t('landing_page.join_desc_2')}</span>, {t('landing_page.join_desc_3')} <span className="italic opacity-70">{t('landing_page.join_desc_4')}</span>.
                        </p>
                        {!user ? (
                            <button onClick={() => navigate("/register")} className="px-6 py-2 bg-[#805ad5] text-white font-bold rounded-md hover:bg-white hover:text-[#1e0a3d] transition-all shadow-lg">
                                {t('landing_page.sign_up')}
                            </button>
                        ) : null}
                    </div>

                    <div className="text-left w-full md:w-auto">
                        <ul className="space-y-1 text-[13px] md:text-[15px] font-normal opacity-80 list-disc list-inside">
                            <li>{t('landing_page.join_desc_1')}</li>
                            <li>{t('landing_page.join_desc_2')}</li>
                            <li>{t('landing_page.join_desc_3')}</li>
                            <li>{t('landing_page.join_desc_4')}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 6. Leaderboard Section */}
            <section className="py-8 md:py-10 bg-background transition-colors duration-300">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-bold">{t('landing_page.leaderboard')}</h2>
                        <div className="flex flex-col text-[12px] font-bold">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1ed5a9]"></span>
                                <span className="text-foreground/80">{t('landing_page.all_time_edits')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></span>
                                <span className="text-foreground/80">{t('landing_page.edits_this_week')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 md:gap-y-10">
                        {leaders.map((user) => (
                            <div key={user.id} className="flex items-center gap-4 group">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: user.bgColor }}
                                    >
                                        {user.initial}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-[1.1rem] hover:text-[#01b4e4] cursor-pointer transition-colors">
                                        {user.name}
                                    </h3>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#c0fecf] to-[#1ed5a9]" style={{ width: user.allTimeWidth }}></div>
                                            </div>
                                            <span className="text-[13px] font-bold w-16 text-right text-foreground/70">
                                                {user.allTime.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-[#f87171]" style={{ width: user.weeklyWidth }}></div>
                                            </div>
                                            <span className="text-[13px] font-bold w-16 text-right text-foreground/70">
                                                {user.weekly.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {isTrailerOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="relative w-[90%] md:w-[800px] aspect-video">
                        <button
                            onClick={() => setIsTrailerOpen(false)}
                            className="absolute -top-10 right-0 text-white text-xl"
                        >
                            ✕
                        </button>
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${trailerKey}`}
                            title="Trailer"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;