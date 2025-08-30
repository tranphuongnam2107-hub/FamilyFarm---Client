import React, { useEffect, useRef, useState } from 'react';
import './CreditCard.css?inline'
import { Link, useLocation } from 'react-router-dom';
import credit_chip from "../../assets/icons/nam_creadit_chip.svg"
import instance from "../../Axios/axiosConfig";
import { toast } from 'react-toastify';

const FormCreditCard = () => {
    const creditCardRef = useRef();
    const [cardNumberText, setCardNumberText] = useState('');
    const [cardName, setCardName] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const location = useLocation(); // 👈 Dùng để kiểm tra path hiện tại
    const [hasCreditCard, setHasCreditCard] = useState(null); // hoặc false mặc định
    const [expiryDate, setExpiryDate] = useState(""); // ISO string
    const [creditNumber, setCreditNumber] = useState("");
    const [creditName, setCreditName] = useState("");

    const roleId = localStorage.getItem("roleId") || sessionStorage.getItem("roleId");

    const fetchCreditCardInfo = async () => {
        try {
            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            const res = await instance.get("/api/account/own-profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 200) {
                const data = res.data.data;
                setHasCreditCard(data.hasCreditCard);
                console.log("check credit data", res.data.data);

                if (data.hasCreditCard) {
                    setCardName(data.creditName || '');
                    const masked = data.creditNumber?.replace(/\d{12}(\d{4})/, "**** **** **** $1");
                    setCardNumberText(masked || '');
                    const date = new Date(data.expiryDate);
                    setExpMonth((date.getMonth() + 1).toString().padStart(2, '0'));
                    setExpYear(date.getFullYear().toString().slice(2));
                }
            }
        } catch (error) {
            console.error("Error loading credit card info:", error);
            toast.error("Failed to load credit card information.");
        }
    };

    useEffect(() => {
        fetchCreditCardInfo();
    }, []);

    useEffect(() => {
        if (!creditCardRef.current) return;

        const input = creditCardRef.current;

        const format_and_pos = (char, backspace) => {
            let start = 0, end = 0, pos = 0;
            const separator = ' ';
            let value = input.value;

            if (char !== false) {
                start = input.selectionStart;
                end = input.selectionEnd;

                if (backspace && start > 0) {
                    start--;
                    if (value[start] === separator) start--;
                }

                value = value.substring(0, start) + char + value.substring(end);
                pos = start + char.length;
            }

            let d = 0, dd = 0, gi = 0;
            let newV = '';
            const groups = /^\D*3[47]/.test(value) ? [4, 6, 5] : [4, 4, 4, 4];

            for (let i = 0; i < value.length; i++) {
                if (/\D/.test(value[i])) {
                    if (start > i) pos--;
                } else {
                    if (d === groups[gi]) {
                        newV += separator;
                        d = 0; gi++;
                        if (start >= i) pos++;
                    }
                    newV += value[i];
                    d++; dd++;
                }
                if (d === groups[gi] && groups.length === gi + 1) break;
            }

            input.value = newV;
            setCardNumberText(newV);
            if (char !== false) input.setSelectionRange(pos, pos);
        };

        const onKeypress = (e) => {
            const code = e.charCode || e.keyCode || e.which;
            if (code !== 9 && (code < 37 || code > 40) && !(e.ctrlKey && (code === 99 || code === 118))) {
                e.preventDefault();
                const char = String.fromCharCode(code);
                const digits = input.value.replace(/\D/g, '');
                const isAmex = /^\D*3[47]/.test(input.value);
                const maxLen = isAmex ? 15 : 16;

                if (/\D/.test(char) || (input.selectionStart === input.selectionEnd && digits.length >= maxLen)) return false;
                format_and_pos(char);
            }
        };

        const onKeydown = (e) => {
            if (e.keyCode === 8 || e.keyCode === 46) {
                e.preventDefault();
                format_and_pos('', input.selectionStart === input.selectionEnd);
            }
        };

        const onPaste = () => setTimeout(() => format_and_pos(''), 50);

        const onBlur = () => format_and_pos(input, false);

        input.addEventListener('keypress', onKeypress);
        input.addEventListener('keydown', onKeydown);
        input.addEventListener('paste', onPaste);
        input.addEventListener('blur', onBlur);

        return () => {
            input.removeEventListener('keypress', onKeypress);
            input.removeEventListener('keydown', onKeydown);
            input.removeEventListener('paste', onPaste);
            input.removeEventListener('blur', onBlur);
        };
    }, []);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // Validate month
    //     const month = Number(expMonth);
    //     if (!month || month < 1 || month > 12) {
    //         toast.error("Invalid expiry month (must be 01 - 12)");
    //         return;
    //     }

    //     // Validate year (must be >= current year)
    //     const currentYear = new Date().getFullYear() % 100; // get YY
    //     const year = Number(expYear);
    //     if (!year || year < currentYear) {
    //         toast.error("Invalid expiry year");
    //         return;
    //     }

    //     // Convert year to 4 digits
    //     const fullYear = 2000 + year;
    //     const expiryDate = new Date(`${fullYear}-${expMonth}-01`).toISOString();

    //     const rawCardNumber = cardNumberText.replace(/\s/g, '');

    //     try {
    //     const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    //     const res = await instance.put("/api/account/update-credit-card", {
    //         creditNumber: rawCardNumber,
    //         creditName: cardName,
    //         expiryDate,
    //     }, {
    //         headers: { Authorization: `Bearer ${token}` },
    //     });

    //     if (res.status === 200) {
    //         toast.success("Credit card saved successfully!");
    //         setHasCreditCard(true);
    //     }
    //     } catch (error) {
    //     toast.error("Failed to save credit card!");
    //     console.error("Error saving card:", error);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const monthNum = Number(expMonth);
        const yearNum = Number(expYear);
        const currentYear = new Date().getFullYear() % 100; // lấy 2 số cuối của năm hiện tại

        if (!creditCardRef.current.value || creditCardRef.current.value.replace(/\s/g, '').length < 16) {
            toast.error("Card number must be 16 digits.");
            return;
        }

        if (!cardName.trim()) {
            toast.error("Card name is required.");
            return;
        }

        if (!expMonth || !expYear) {
            toast.error("Expiry date is required.");
            return;
        }

        if (monthNum < 1 || monthNum > 12) {
            toast.error("Month must be between 01 and 12.");
            return;
        }

        if (expYear.length !== 2 || yearNum < currentYear) {
            toast.error("Year is invalid or expired.");
            return;
        }

        try {
            const expiry = `20${expYear.padStart(2, "0")}-${expMonth.padStart(2, "0")}-01`;

            const payload = {
                creditNumber: creditCardRef.current.value.replace(/\s/g, ''),
                creditName: cardName,
                expiryDate: expiry,
            };

            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            await instance.put("/api/account/update-credit-card", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Credit card saved successfully!");
            fetchCreditCardInfo();
        } catch (err) {
            console.error("Error saving card:", err);
            toast.error("Failed to save credit card.");
        }
    };


    return (
        <div className="FormCreditCard pt-36 pb-16">
            <div className="select-btn-payment flex flex-row gap-4 px-6 mb-4">
                {roleId === "68007b0387b41211f0af1d56" && (
                    <Link
                        to="/PaymentUserPage"
                        className={`list-user-payment px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${location.pathname === "/PaymentUserPage"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 hover:bg-green-100 text-gray-700"
                            }`}
                    >
                        List Payment
                    </Link>
                )}

                {roleId === "68007b2a87b41211f0af1d57" && (
                    <Link
                        to="/CreditCardPage"
                        className={`list-user-payment px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${location.pathname === "/CreditCardPage"
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 hover:bg-green-100 text-gray-700"
                            }`}
                    >
                        Credit Card
                    </Link>
                )}
            </div>
            <div className="site-credit" id='page-credit'>
                <div className='container-credit'>
                    <div className='outer-credit'>
                        <div className='header-credit'>
                            <div className='logo-credit'>
                                <Link to=""><strong>Family</strong>Farm</Link>
                            </div>
                            <div className='title-credit'>Card Settings</div>
                        </div>
                        <section className='payment-credit'>
                            <div className='left-credit'>
                                <form onSubmit={handleSubmit}>
                                    <div className='card-number'>
                                        <p>Card Number</p>
                                        <span>Enter the 16-digit card number on the card</span>
                                        <div className='card-number-box'>
                                            <input type='text' id='credit-card' autoComplete='off' value={cardNumberText} placeholder='xxxx - xxxx - xxxx - xxxx' ref={creditCardRef} />
                                            <span className='cc-logo'></span>
                                        </div>
                                    </div>

                                    <div className='card-holder'>
                                        <div className='text'>
                                            <p>Card Name holder</p>
                                            <span>Enter name card holder on the card</span>
                                        </div>
                                        <div className='input-credit'>
                                            <input type='text' id='card-name' autoComplete='off' value={cardName} required onChange={(e) => setCardName(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className='card-expiration'>
                                        <div className='text'>
                                            <p>Expiry Date</p>
                                            <span>Enter the expiration date of the card</span>
                                        </div>
                                        <div className='input-credit'>
                                            {/* <input type='number' id='exp-month' placeholder='MM' data-maxlength="2" required value={expMonth} onChange={(e) => setExpMonth(e.target.value.slice(0, 2))} />
                                            <strong> / </strong>
                                            <input type='number' id='exp-year' placeholder='YY' data-maxlength="2" required value={expYear} onChange={(e) => setExpYear(e.target.value.slice(0, 2))} /> */}
                                            <div className='input-credit'>
                                                {/* <input
                                                type='text'
                                                id='exp-month'
                                                placeholder='MM'
                                                maxLength={2}
                                                required
                                                value={expMonth}
                                                onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); // chỉ cho phép số
                                                if (value === '' || (Number(value) >= 1 && Number(value) <= 12)) {
                                                    setExpMonth(value.padStart(2, '0')); // định dạng '01' thay vì '1'
                                                }
                                                }}
                                            /> */}
                                                <input
                                                    type="text"
                                                    id="exp-month"
                                                    placeholder="MM"
                                                    maxLength={2}
                                                    required
                                                    value={expMonth}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, ''); // Chỉ số
                                                        if (raw.length <= 2) {
                                                            setExpMonth(raw);
                                                        }
                                                    }}
                                                />
                                                <strong> / </strong>
                                                <input
                                                    type='text'
                                                    id='exp-year'
                                                    placeholder='YY'
                                                    maxLength={2}
                                                    required
                                                    value={expYear}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, ''); // chỉ cho phép số
                                                        if (value.length <= 2) {
                                                            setExpYear(value);
                                                        }
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <button>Save Card</button>
                                </form>
                            </div>

                            <div className='right-credit'>
                                <div className='card-virtual'>
                                    <p className='cc-logo'></p>
                                    <p className='name-holder'>{cardName || 'Name of user'}</p>
                                    <p className='chip'>
                                        <img src={credit_chip} alt='' />
                                    </p>
                                    <p className='highlight'>
                                        <span className='last-digit' id='card-number'>
                                            {cardNumberText || '.... .... .... 4567'}
                                        </span>
                                        <span className='expiry'>
                                            <span className='exp-month'>{expMonth || 'MM'}</span> /
                                            <span className='exp-year'> {expYear || 'YY'}</span>
                                        </span>
                                    </p>
                                </div>

                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormCreditCard