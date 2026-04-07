import { useTranslation } from 'react-i18next';

const SeverityBadge = ({ level }) => {
  const { t } = useTranslation();
  
  // Normalize string to match css classes
  const normalizedLevel = level?.toLowerCase() || 'low';
  
  return (
    <span className={`badge severity-${normalizedLevel}`}>
      {t(normalizedLevel)}
    </span>
  );
};

export default SeverityBadge;
