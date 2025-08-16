"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // 监听滚动事件，决定按钮是否可见
    useEffect(() => {
        const toggleVisibility = () => {
            // 如果页面滚动超过300px，显示按钮
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        // 初始检查
        toggleVisibility();

        // 清理监听器
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // 点击回到顶部
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 z-50"
                    aria-label="回到顶部"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>
            )}
        </>
    );
}
