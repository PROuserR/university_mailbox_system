'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// --- Mock Component for demonstration ---
// Replace this with your actual Logo component/image
const MailLogo = () => (
    <div className="relative w-24 h-24">
        {/* Placeholder for the actual circular logo image */}
        <div className="bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
            MAIL
        </div>
    </div>
);

const ForgotPasswordPage = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic (e.g., calling an API to send reset link)
        console.log("Password reset requested.");
    };

    return (
        // Main Container: Centers content on the screen
        <div className="flex w-full h-full items-center justify-center min-h-screen bg-gray-50 p-4">

            {/* Card Wrapper: Defines the visible, contained element */}
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl transition-all duration-300">

                {/* Header Section (Logo and Title) */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-extrabold text-gray-800 mt-4">
                        استعادة كلمة المرور
                    </h1>
                    <p className="text-gray-500 mt-1 text-base">
                        يرجى إدخال بريدك الإلكتروني لاستقبال رابط إعادة تعيين كلمة المرور.
                    </p>
                </div>

                {/* The Form */}
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Input Field: Email/Username */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1" dir='rtl'>
                            البريد الإلكتروني أو اسم المستخدم *
                        </label>
                        <div className="relative flex flex-row-reverse items-center">
                            {/* Icon Placement */}
                            <div className="absolute inset-y-0 right-4 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                            </div>

                            {/* Input Element */}
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="البريد الإلكتروني أو اسم المستخدم"
                                required
                                className="block w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-right"
                            />
                        </div>
                    </div>

                    {/* Forgot Password Button (Primary Action) */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        إرسال رابط إعادة التعيين
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                        هل نسيت شيئًا آخر؟
                        <a href="/support" className="ml-1 font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                            مساعدة
                        </a>
                    </div>

                    {/* If the user is on a truly lost screen, maybe link back to login */}
                    <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer block">
                        العودة إلى الصفحة الرئيسية
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
