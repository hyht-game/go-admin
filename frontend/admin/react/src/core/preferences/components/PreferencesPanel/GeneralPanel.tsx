import React from 'react';
import { Select, Segmented, Switch } from 'antd';
import { usePreferencesStore } from '../../store';
import type { SupportedLanguagesType } from '../../types';

/** 页面切换动画选项 */
const TRANSITION_OPTIONS = [
  { label: '淡入', value: 'fade' },
  { label: '淡入下滑', value: 'fade-down' },
  { label: '淡入滑动', value: 'fade-slide' },
  { label: '淡入上滑', value: 'fade-up' },
];

/** 语言选项 */
const LANGUAGE_OPTIONS = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

export const GeneralPanel: React.FC = () => {
  const { preferences, setPreferences } = usePreferencesStore();

  const handleLanguageChange = (locale: SupportedLanguagesType) => {
    setPreferences({ app: { locale } });
  };

  return (
    <div className="preference-panel">
      <section className="preference-section">
        <h3 className="section-title">通用</h3>

        <div className="preference-item">
          <span>语言</span>
          <Select
            value={preferences.app.locale}
            options={LANGUAGE_OPTIONS}
            onChange={handleLanguageChange}
            style={{ width: 200 }}
          />
        </div>

        <div className="preference-item">
          <span>动态标题</span>
          <Switch
            checked={preferences.app.dynamicTitle}
            onChange={(checked) => setPreferences({ app: { dynamicTitle: checked } })}
          />
        </div>

        <div className="preference-item">
          <span>水印</span>
          <Switch
            checked={preferences.app.watermark}
            onChange={(checked) => setPreferences({ app: { watermark: checked } })}
          />
        </div>

        <div className="preference-item">
          <span>定时检查更新</span>
          <Switch
            checked={preferences.app.enableCheckUpdates}
            onChange={(checked) => setPreferences({ app: { enableCheckUpdates: checked } })}
          />
        </div>
      </section>

      <section className="preference-section">
        <h3 className="section-title">动画</h3>

        <div className="preference-item">
          <span>页面切换进度条</span>
          <Switch
            checked={preferences.transition.progress}
            onChange={(checked) => setPreferences({ transition: { progress: checked } })}
          />
        </div>

        <div className="preference-item">
          <span>页面切换 Loading</span>
          <Switch
            checked={preferences.transition.loading}
            onChange={(checked) => setPreferences({ transition: { loading: checked } })}
          />
        </div>

        <div className="preference-item">
          <span>页面切换动画</span>
          <Switch
            checked={preferences.transition.enable}
            onChange={(checked) => setPreferences({ transition: { enable: checked } })}
          />
        </div>

        <div
          className={`transition-animations ${!preferences.transition.enable ? 'disabled' : ''}`}
        >
          <Segmented
            disabled={!preferences.transition.enable}
            options={TRANSITION_OPTIONS}
            value={preferences.transition.name}
            onChange={(value) => setPreferences({ transition: { name: value as string } })}
            block
          />
        </div>
      </section>
    </div>
  );
};
