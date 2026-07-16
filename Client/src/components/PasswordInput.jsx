import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PasswordInput = ({ value, onChange, placeholder, className }) => {
    const [isShowPassword, setIsShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setIsShowPassword(!isShowPassword);
    };

    return (
        <div className="relative">
            <input
                value={value}
                onChange={onChange}
                type={isShowPassword ? "text" : "password"}
                placeholder={placeholder || "Password"}
                className={className || "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium pr-10"}
                required
            />
            <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors duration-200"
            >
                {isShowPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                ) : (
                    <EyeIcon className="w-4 h-4" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;