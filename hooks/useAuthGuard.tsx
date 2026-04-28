'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
    const router = useRouter();

    useEffect(() => {
        if(localStorage.length === 0){
            router.push("/auth/login")
        }
    }, [router]);

    return <></>;
}