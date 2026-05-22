import {Outlet} from 'react-router-dom';
import {ConfigProvider, theme} from 'antd';
import {useMemo} from 'react';

import {usePreferences} from '@/core/preferences';

/**
 * 空白布局 - 用于 404/403/500 等错误页面
 * 只提供主题配置和 Outlet，不包含侧边栏、导航等
 */
const BlankLayout = () => {
    const {isDark} = usePreferences();

    const algorithm = useMemo(() => {
        return isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
    }, [isDark]);

    return (
        <ConfigProvider
            theme={{
                algorithm,
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 6,
                },
            }}
        >
            <Outlet/>
        </ConfigProvider>
    );
};

export default BlankLayout;