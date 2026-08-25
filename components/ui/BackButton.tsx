// =========================
// COMPONENT: BackButton
// =========================

import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BackButtonProps {
    onClick: () => void;
    hasChanges?: boolean;
    className?: string;
    variant?: 'compact' | 'default' | 'icon-only' | 'minimal';
}

export const BackButton: React.FC<BackButtonProps> = ({ 
    onClick, 
    hasChanges = false, 
    className = "",
    variant = 'compact'
}) => {
    const handleClick = () => {
        if (hasChanges) {
            if (confirm('هل أنت متأكد من الرجوع؟ سيتم فقدان التغييرات غير المحفوظة.')) {
                onClick();
            }
        } else {
            onClick();
        }
    };

    // أنماط مختلفة حسب الـ variant
    const variants = {
        compact: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 text-xs",
        default: "flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium",
        'icon-only': "w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-600",
        minimal: "w-7 h-7 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-600"
    };

    return (
        <button
            onClick={handleClick}
            className={`${variants[variant]} ${className}`}
        >
            <FontAwesomeIcon icon={faArrowRight} className={variant === 'compact' ? "text-[10px]" : variant === 'default' ? "text-sm" : "text-sm"} />
            {variant !== 'icon-only' && variant !== 'minimal' && 'رجوع'}
        </button>
    );
};