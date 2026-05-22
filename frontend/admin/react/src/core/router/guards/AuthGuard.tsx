import {Navigate, useLocation} from 'react-router-dom';
import React from "react";
import {useAuthStore} from '@/stores';

interface AuthGuardProps {
    isAuthenticated?: boolean;
    children: React.ReactNode;
    loginPath?: string;
}

export const AuthGuard = ({
                              isAuthenticated: isAuthenticatedProp,
                              children,
                              loginPath = '/login'
                          }: AuthGuardProps) => {
    const location = useLocation();
    // 若未显式传入 isAuthenticated，则从 store 读取
    const isAuthenticated = isAuthenticatedProp ?? !!useAuthStore.getState().accessToken;
    if (!isAuthenticated) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`${loginPath}?redirect=${redirect}`} replace/>;
    }
    return <>{children}</>;
};
