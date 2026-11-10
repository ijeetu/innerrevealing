"use client";
import { useSelector } from 'react-redux';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
export default function BrandLogo() {
  const settings = useSelector(settingsSelector);
  return <img src={settings.data.horizontal_logo || '/inner-revealing-logo.png'} alt={settings.data.app_name || 'Inner Revealing Meditation Centre'} width={1774} height={887} className="ir-lms-logo" loading="eager" fetchPriority="high" decoding="async" />;
}
