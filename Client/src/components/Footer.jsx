import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 text-slate-600">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand Column */}
                    <div className="flex items-center space-x-3">
                        <Link to="/" className="flex items-center">
                            <img src={Logo} alt="Handscape" className="h-6 w-auto" />
                        </Link>
                        <span className="text-slate-300">|</span>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            A minimalist community catalog dedicated to manual photography and artistic perspectives.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors">Home</Link>
                        <Link to="/posts" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors">Gallery</Link>
                        <Link to="/profile" className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors">Profile</Link>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-6 mt-6 border-t border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400">
                        &copy; {currentYear} Handscape Catalog. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
