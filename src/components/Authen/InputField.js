
// Hàm để render input với icon mắt
export const PasswordInput = ({ name, placeholder, value, error, onChange, showPassword, togglePasswordVisibility }) => {
    return (
        <div className="mb-5">
            <div className="relative">
                <input
                    type={showPassword[name] ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm w-full p-3 py-3.5 ${error ? 'border-red-500' : ''}`}
                />
                <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => togglePasswordVisibility(name)}
                >
                    {showPassword[name] ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                </span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

// Hàm để render input thông thường
export const TextInput = ({ name, placeholder, value, error, onChange }) => {
    return (
        <div>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm w-full p-3 py-3.5 ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};